import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ReactHtmlParser from "html-react-parser";
import { SubContentType } from "../../../interfaces/IApp";
const PlotlyWithNoSSR = dynamic(() => import("react-plotly.js"), {
    ssr: false,
});

import { useRef } from "react";

const ScriptComponent = ({scripts}) => {
    const instance = useRef();

    useEffect(() => {
        var scriptElem = document.createElement("script");
        if (scripts.attribs.src != null) scriptElem.src = scripts.attribs.src;
        if (scripts.children != null) {
            for (let node of scripts.children) {
                var textNode = document.createTextNode(scripts.children[0].data);
                scriptElem.appendChild(textNode);
            }
        }
        console.log("ResultContent text ", scriptElem);
        scriptElem.onload = function () {
            console.log("ResultContent script load");
        };
        instance.current?.appendChild(scriptElem)
    }, [scripts]);

    return (
        <>
            <div ref={instance}></div>
        </>
    )
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

    const createResultContent = () => {
        const imageMime = getMimeWithImage(Object.keys(codeResult?.result?.content));
        // console.log("ResultContent: ", codeResult?.result);
        if (SubContentType.APPLICATION_PLOTLY in codeResult?.result?.content) {
            return React.createElement(
                PlotlyWithNoSSR,
                setPlotlyLayout(codeResult?.result?.content[SubContentType.APPLICATION_PLOTLY])
            );
        } else if (SubContentType.APPLICATION_JSON in codeResult?.result?.content) {
            return JSON.stringify(codeResult?.result?.content[SubContentType.APPLICATION_JSON]);
        } else if (imageMime !== null) {
            console.log("ResultView ", imageMime, codeResult?.result?.content[imageMime]);
            return (
                <img
                    src={"data:" + imageMime + ";base64," + codeResult?.result?.content[imageMime]}
                />
            );
        } else if (SubContentType.TEXT_HTML in codeResult?.result?.content) {
            // console.log("ResultContent: ", codeResult?.result?.content[SubContentType.TEXT_HTML]);
            return ReactHtmlParser(
                codeResult?.result?.content[SubContentType.TEXT_HTML].toString("base64"),
                {
                    replace: function (domNode) {
                        // console.log("ResultContent domNode ", domNode);
                        if (domNode.type === "script") {
                            return (<ScriptComponent scripts={domNode}/>)
                        }
                    },
                }
            );
        }

        return null;
    };

    // useEffect(() => {
    //     setReadyToScroll(true);
    // }, []);

    return createResultContent();
});

export default ResultContent;
