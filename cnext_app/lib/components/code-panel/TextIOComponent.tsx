import React, { useState } from "react";
import {
    TextIOContainer,
    TextIOHeaderText,
    TextIOContent,
    TextIOHeader,
} from "../StyledComponents";
import dynamic from "next/dynamic";
import ConsoleComponent from "./text-io/Console";
const TerminalComponent = dynamic(() => import("./text-io/Terminal"), { ssr: false });

const TAB = {
    CONSOLE: "Console",
    TERMINAL: "Terminal",
};

const TextIOComponent = React.memo(() => {
    const [textIOPanelID, setTextIOPanelID] = useState(TAB.CONSOLE);
    return (
        <TextIOContainer>
            {console.log("Render TextIOContainer")}
            <TextIOHeader>
                <TextIOHeaderText
                    onClick={() => setTextIOPanelID(TAB.CONSOLE)}
                    variant="overline"
                    underline={textIOPanelID === TAB.CONSOLE ? true : false}
                    component="span"
                >
                    {TAB.CONSOLE}
                </TextIOHeaderText>
                <TextIOHeaderText
                    onClick={() => setTextIOPanelID(TAB.TERMINAL)}
                    variant="overline"
                    underline={textIOPanelID === TAB.TERMINAL ? true : false}
                    component="span"
                >
                    {TAB.TERMINAL}
                </TextIOHeaderText>
            </TextIOHeader>
            {textIOPanelID === TAB.CONSOLE ? (
                <TextIOContent id={TAB.CONSOLE}>
                    <ConsoleComponent id={TAB.CONSOLE} />
                </TextIOContent>
            ) : null}
            {textIOPanelID === TAB.TERMINAL ? (
                <TextIOContent id={TAB.TERMINAL}>
                    <TerminalComponent />
                </TextIOContent>
            ) : null}
        </TextIOContainer>
    );
});

export default TextIOComponent;
