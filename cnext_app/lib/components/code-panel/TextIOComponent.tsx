import React, { useState } from "react";
import {
    TextIOContainer,
    TextIOHeaderText,
    TextIOContent,
    TextIOHeader,
} from "../StyledComponents";
import dynamic from "next/dynamic";
import ConsoleComponent from "./text-io/Console";
import ExecutorStatus from "../executor-manager/ExecutorStatus";
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
                {[TAB.CONSOLE, TAB.TERMINAL].map((item, key) => {
                    return (
                        <TextIOHeaderText
                            key={key}
                            onClick={() => setTextIOPanelID(item)}
                            variant="overline"
                            underline={textIOPanelID === item ? true : false}
                            component="span"
                        >
                            {item}
                        </TextIOHeaderText>
                    );
                })}
                <ExecutorStatus />
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
