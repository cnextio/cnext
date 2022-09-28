import dynamic from "next/dynamic";
import React from "react";
import { SubContentType } from "../../../interfaces/IApp";
import { isImageMime, setPlotlyLayout } from "../../libs";
const Plotly = dynamic(() => import("react-plotly.js"), { ssr: false });
import ReactHtmlParser, { attributesToProps, domToReact } from "html-react-parser";

export const createPlot = (
    data: { [index: string]: string } | null,
    width: number,
    height: number,
) => {
    if (data) {
        const resultElements = Object.keys(data)?.map((key, index) => {
            if (key === SubContentType.APPLICATION_PLOTLY) {
                return React.createElement(
                    Plotly,
                    setPlotlyLayout(data[key], width, height, false)
                );
            } else if (key === SubContentType.IMAGE_SVG_XML) {
                return ReactHtmlParser(data[key].toString("base64"), {
                    replace: (domNode) => {
                        if (domNode.attribs && domNode.name === "svg") {
                            const props = attributesToProps(domNode.attribs);
                            props.width = `${width}pt`;
                            props.height = `${height}pt`;
                            props.preserveAspectRatio = "none";
                            // props.viewBox = `0, 0, ${width}, ${height}`; 
                            console.log("svg :", props.viewBox);
                            return <svg {...props} children={domToReact(domNode.children)}></svg>;
                        }
                    },
                });
            } else if (isImageMime(key)) {
                return <img src={"data:" + key + ";base64," + data[key]} />;
            }
        });
        return resultElements;
    }
};
