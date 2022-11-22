import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ReactHtmlParser, { attributesToProps, domToReact } from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ContentType, SubContentType } from "../../../interfaces/IApp";
const PlotlyWithNoSSR = dynamic(() => import("react-plotly.js"), {
    ssr: false,
});

import { useRef } from "react";
import ReactDOM, { createPortal } from "react-dom";
import Ansi from "../../ansi-to-react";
import { InputComponent } from "./StdInInput";
import { isImageMime, setPlotlyLayout } from "../../libs";

const ScriptComponent = ({ children, script }) => {
    /** We only use this ref for temp div holder of the position for the script.
     * The script will be append to the parent of this div which is the correct position of the script in the dom.
     * We have to do this because there is no way to get the ref to the parent div directly */
    const tmpRef = useRef();
    useEffect(() => {
        var scriptElem = document.createElement("script");
        // console.log("ResultContent script ", script);
        if (script != null) {
            /** sometimes the script source is stored in script.attribs.src */
            if (script.attribs != null && script.attribs.src != null) {
                scriptElem.src = script.attribs.src;
            }
            if (script.children != null) {
                for (let node of script.children) {
                    let textNode = document.createTextNode(node.data);
                    scriptElem.appendChild(textNode);
                }
            }
        }

        if (children != null) {
            scriptElem.appendChild(document.createTextNode(children));
        }

        let parent = ReactDOM.findDOMNode(tmpRef?.current)?.parentNode;

        /** Some ipython pluggin need an elemen named `element` to work. So we create one here */
        var ipyElement = document.createElement("script");
        ipyElement.appendChild(
            document.createTextNode("var element = document.currentScript.parentNode")
        );
        parent?.appendChild(ipyElement);

        // console.log("ResultContent parent scriptElem ", parent, scriptElem);
        /** the script will be appended to the parent div which is the correct position of the script in the dom */
        parent?.appendChild(scriptElem);
    }, [script]);

    return <div ref={tmpRef}></div>;
};

const IFrameComponent = ({ children, attribs, stopMouseEvent }: {children: object|null, attribs: object|null, stopMouseEvent: boolean}) => {
    const [containerRef, setContainerRef] = useState();

    const renderChildren = () => {
        const mountNode = containerRef?.contentDocument;
        let childElements = [];
        let headElements, bodyElements;
        if (!children) {
            return null;
        }
        if (children instanceof Array) {
            childElements = children;
        } else if (children instanceof Object && children.type === "html") {
            childElements = children.props.children;
        }
        for (let child of childElements) {
            if (child.type === "head") {
                headElements = child.props.children;
            } else if (child.type === "body") {
                bodyElements = child.props.children;
            }
        }
        return (
            <>
                {headElements && mountNode && createPortal(headElements, mountNode?.head)}
                {bodyElements && mountNode && createPortal(bodyElements, mountNode?.body)}
            </>
        );
    };

    return (
        <iframe
            style={{
                width: "100%",
                height: "100vh",
                border: "0px solid white",
                padding: "0px",
                pointerEvents: stopMouseEvent ? "none" : "auto",
            }}
            ref={setContainerRef}
            src={attribs?.src}
            srcDoc={attribs?.srcdoc}
        >
            {renderChildren()}
        </iframe>
    );
};

const ResultContent = React.memo(({ codeResult, showMarkdown, stopMouseEvent }) => {
    const renderResultContent = () => {
        try {
            // const imageMime = getMimeWithImage(Object.keys(codeResult?.result?.content));
            // console.log("ResultContent: ", codeResult);
            // const showMarkdown = store.getState().projectManager.settings?.rich_output?.show_markdown;
            let results = [];
            let resultElements = null;
            let inputElement;
            let markdownElement;

            if (codeResult?.result) {
                if (codeResult?.result instanceof Array) {
                    results = codeResult?.result;
                } else {
                    // this part is to make it backward compatible with prev result format
                    results = [codeResult?.result];
                }

                resultElements = results.map((result) => {
                    const contentKeys = Object.keys(result.content);

                    let resultElements: (string | JSX.Element | JSX.Element[] | undefined)[] = [];
                    if (result.type !== ContentType.INPUT_REQUEST) {
                        resultElements = contentKeys?.map((key, index) => {
                            if (key === SubContentType.APPLICATION_JAVASCRIPT) {
                                return (
                                    <ScriptComponent
                                        script={null}
                                        children={result?.content[key].toString("base64")}
                                    />
                                );
                                // } else if (key === SubContentType.APPLICATION_BOKEH) {
                                //     return (
                                //         <ScriptComponent
                                //             script={null}
                                //             children={result?.content[key].toString("base64")}
                                //         />
                                //     );
                            } else if (key === SubContentType.APPLICATION_PLOTLY) {
                                return React.createElement(
                                    PlotlyWithNoSSR,
                                    setPlotlyLayout(result?.content[key])
                                );
                            } else if (key === SubContentType.APPLICATION_JSON) {
                                return JSON.stringify(result?.content[key]);
                            } else if (key === SubContentType.IMAGE_SVG_XML) {
                                return ReactHtmlParser(result?.content[key].toString("base64"), {
                                    replace: (domNode) => {
                                        if (domNode.attribs && domNode.name === "svg") {
                                            const props = attributesToProps(domNode.attribs);
                                            // props.width = "500px";
                                            // props.height = "500px";
                                            return (
                                                <svg
                                                    {...props}
                                                    children={domToReact(domNode.children)}
                                                ></svg>
                                            );
                                        }
                                    },
                                });
                            } else if (isImageMime(key)) {
                                // console.log("ResultView ", imageMime, result?.content[imageMime]);
                                return (
                                    <img src={"data:" + key + ";base64," + result?.content[key]} />
                                );
                            } else if (key === SubContentType.TEXT_HTML) {
                                const htmlRegex = new RegExp("<!DOCTYPE html|<html", "i");
                                const iframeRegex = new RegExp("<iframe", "i");
                                const htmlContent = result?.content[key];
                                // console.log("ResultContent text/html content: ", htmlContent);
                                let isIFrame = iframeRegex.test(htmlContent);
                                let isHTMLPage = htmlRegex.test(htmlContent);
                                let jsxElements = ReactHtmlParser(htmlContent.toString("base64"), {
                                    replace: function (domNode) {
                                        // console.log("ResultContent domNode ", domNode.name);
                                        if (domNode.type === "tag" && domNode.name === "iframe") {
                                            // TODO: test this
                                            return (
                                                <IFrameComponent
                                                    attribs={domNode.attribs}
                                                    // children={domNode.children}
                                                    stopMouseEvent={stopMouseEvent}
                                                ></IFrameComponent>
                                            );
                                        } else if (domNode.type === "script") {
                                            return (
                                                <ScriptComponent children={null} script={domNode} />
                                            );
                                        }
                                    },
                                });

                                if (isHTMLPage) {
                                    return (
                                        <IFrameComponent
                                            children={jsxElements}
                                            stopMouseEvent={stopMouseEvent}
                                        ></IFrameComponent>
                                    );
                                } else if (isIFrame) {
                                    return jsxElements;
                                } else {
                                    return <div>{jsxElements}</div>;
                                }
                            } else if (
                                showMarkdown &&
                                key === SubContentType.MARKDOWN &&
                                result?.content[SubContentType.MARKDOWN] != null
                            ) {
                                /** this will be added to the front at the end */
                                markdownElement = (
                                    <ReactMarkdown
                                        className="markdown"
                                        remarkPlugins={[remarkGfm]}
                                        children={result?.content[key]}
                                    />
                                );
                            } else if (
                                key === SubContentType.TEXT_PLAIN &&
                                contentKeys.length === 1
                            ) {
                                /** only display text/plain when it is the only content */
                                return (
                                    <pre
                                        style={{ fontSize: "12px" }}
                                        children={result?.content[key]}
                                    />
                                );
                            }
                        });
                    } else {
                        inputElement = <InputComponent resultContent={result.content} />;
                    }
                    if (resultElements instanceof Array) return resultElements.flat();
                    else return resultElements;
                });
            }

            if (codeResult?.textOutput) {
                let textElement = (
                    <pre
                        style={{ fontSize: "12px", whiteSpace: "pre-wrap", paddingLeft: "10px" }}
                        // children={codeResult?.textOutput.content}
                    >
                        <Ansi>{codeResult?.textOutput.content}</Ansi>
                    </pre>
                );
                if (resultElements instanceof Array) {
                    /** only display text/plain when it is the only content */
                    resultElements.push(textElement);
                } else {
                    resultElements = [textElement];
                }
            }

            /** inputElement has to be at the end */
            if (inputElement) resultElements.push(inputElement);
            /** markdown is pushed to the front of the array */
            if (markdownElement) resultElements.unshift(markdownElement);
            // console.log("ResultContent renderResultContent: ", resultElements);
            return resultElements;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    // useEffect(() => {
    //     setReadyToScroll(true);
    // }, []);

    return renderResultContent();
});

export default ResultContent;
