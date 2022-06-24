import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ReactHtmlParser from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SubContentType } from "../../../interfaces/IApp";
const PlotlyWithNoSSR = dynamic(() => import("react-plotly.js"), {
    ssr: false,
});

import { useRef } from "react";
import { createPortal } from "react-dom";
import store from "../../../../redux/store";

const ScriptComponent = ({ children, script }) => {
    const instance = useRef();

    useEffect(() => {
        var scriptElem = document.createElement("script");
        // console.log("ResultContent script ", script);
        if (script != null) {
            if (script.attribs != null && script.attribs.src != null)
                scriptElem.src = script.attribs.src;
            if (script.children != null) {
                for (let node of script.children) {
                    var textNode = document.createTextNode(node.data);
                    scriptElem.appendChild(textNode);
                }
            }
        }
        if (children != null) {
            scriptElem.appendChild(document.createTextNode(children));
        }
        console.log("ResultContent scriptElem ", scriptElem);
        scriptElem.onload = function () {
            console.log("ResultContent script load");
        };
        instance.current?.appendChild(scriptElem);
    }, [script]);

    return <div ref={instance}></div>;
};

const IFrameComponent = ({ children }) => {
    const [contentRef, setContentRef] = useState(null);
    const mountNode = contentRef?.contentDocument?.body;
    return (
        <iframe
            style={{ width: "100%", height: "100vh", border: "0px solid white" }}
            ref={setContentRef}
        >
            {mountNode && createPortal(children, mountNode)}
        </iframe>
    );
};

const ResultContent = React.memo(({ codeResult }) => {
    // const [readyToScroll, setReadyToScroll] = useState(false);

    const setPlotlyLayout = (
        data: object | string | any,
        width: number | null = null,
        height: number | null = null
    ) => {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let inResultData = JSON.parse(JSON.stringify(data));
            inResultData["data"][0]["hovertemplate"] = "%{x}: %{y}";
            inResultData.layout.width = width ? width : inResultData.layout.width;
            inResultData.layout.height = height ? height : inResultData.layout.height;
            inResultData.layout.margin = { b: 10, l: 80, r: 30, t: 30 };
            inResultData["config"] = { displayModeBar: false };
            return inResultData;
        } catch {
            return null;
        }
    };

    const getMimeWithImage = (mimeTypes: string[]) => {
        for (let i = 0; i < mimeTypes.length; i++) {
            if (mimeTypes[i].includes("image/")) {
                return mimeTypes[i];
            }
        }
        return null;
    };

    const renderResultContent = () => {
        // const imageMime = getMimeWithImage(Object.keys(codeResult?.result?.content));
        // console.log("ResultContent: ", codeResult?.result);
        const showMarkdown = store.getState().projectManager.settings?.rich_output?.show_markdown;
        
        let jsxElements = Object.keys(codeResult?.result?.content).map((key, index) => {
            const imageMime = getMimeWithImage([key]);
            if (key === SubContentType.APPLICATION_JAVASCRIPT) {
                return (
                    <ScriptComponent script={null}>
                        {codeResult?.result?.content[
                            SubContentType.APPLICATION_JAVASCRIPT
                        ].toString("base64")}
                    </ScriptComponent>
                );
            } else if (key === SubContentType.APPLICATION_BOKEH) {
                return (
                    <ScriptComponent script={null}>
                        {codeResult?.result?.content[SubContentType.APPLICATION_BOKEH].toString(
                            "base64"
                        )}
                    </ScriptComponent>
                );
            } else if (key === SubContentType.APPLICATION_PLOTLY) {
                return React.createElement(
                    PlotlyWithNoSSR,
                    setPlotlyLayout(codeResult?.result?.content[SubContentType.APPLICATION_PLOTLY])
                );
            } else if (key === SubContentType.APPLICATION_JSON) {
                return JSON.stringify(codeResult?.result?.content[SubContentType.APPLICATION_JSON]);
            } else if (imageMime != null) {
                // console.log("ResultView ", imageMime, codeResult?.result?.content[imageMime]);
                return (
                    <img
                        src={
                            "data:" +
                            imageMime +
                            ";base64," +
                            codeResult?.result?.content[imageMime]
                        }
                    />
                );
            } else if (key === SubContentType.TEXT_HTML) {
                const htmlRegex = new RegExp("<!DOCTYPE html>|<html>");
                const htmlContent = codeResult?.result?.content[SubContentType.TEXT_HTML];
                // console.log("ResultContent text/html content: ", htmlContent);
                let isFullPage = htmlRegex.test(htmlContent);
                let jsxElements = ReactHtmlParser(htmlContent.toString("base64"), {
                    replace: function (domNode) {
                        // console.log("ResultContent domNode ", domNode);
                        if (domNode.type === "script") {
                            return <ScriptComponent children={null} script={domNode} />;
                        }
                    },
                });

                return isFullPage ? (
                    <IFrameComponent children={jsxElements}></IFrameComponent>
                ) : (
                    jsxElements
                );
            } else if (showMarkdown && key === SubContentType.MARKDOWN) {
                return (
                    <ReactMarkdown
                        className="markdown"
                        remarkPlugins={[remarkGfm]}
                        children={codeResult?.result?.content[SubContentType.MARKDOWN]}
                    />
                );
            }
        });
        console.log("ResultContent renderResultContent: ", jsxElements);
        return <div>{jsxElements}</div>;
    };

    // useEffect(() => {
    //     setReadyToScroll(true);
    // }, []);

    return renderResultContent();
});

export default ResultContent;
