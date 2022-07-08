import React, { useState } from "react";
import {
    ControlPanelContainer,
    ControlPanelHeaderText,
    ControlPanelContent,
    ControlPanelHeader,
} from "../StyledComponents";
import dynamic from "next/dynamic";
import ConsoleComponent from "./control-panel/Console";
const TerminalComponent = dynamic(() => import("./control-panel/Terminal"), { ssr: false });

const TAB = {
    CONSOLE: "Console",
    TERMINAL: "Terminal",
};

const ControlPanelComponent = React.memo(() => {
    const [controlPanelID, setControlPanelID] = useState(TAB.CONSOLE);
    return (
        <ControlPanelContainer>
            {console.log("Render ControlPanelAreaComponent")}
            <ControlPanelHeader>
                <ControlPanelHeaderText
                    onClick={() => setControlPanelID(TAB.CONSOLE)}
                    variant="overline"
                    underline={controlPanelID === TAB.CONSOLE ? true : false}
                    component="span"
                >
                    Console
                </ControlPanelHeaderText>
                <ControlPanelHeaderText
                    onClick={() => setControlPanelID(TAB.TERMINAL)}
                    underline={controlPanelID === TAB.TERMINAL ? true : false}
                    variant="overline"
                    component="span"
                >
                    Terminal
                </ControlPanelHeaderText>
            </ControlPanelHeader>
            {controlPanelID === TAB.CONSOLE ? (
                <ControlPanelContent id={TAB.CONSOLE}>
                    <ConsoleComponent />
                </ControlPanelContent>
            ) : null}
            {controlPanelID === TAB.TERMINAL ? (
                <ControlPanelContent id={TAB.TERMINAL}>
                    <TerminalComponent />
                </ControlPanelContent>
            ) : null}
        </ControlPanelContainer>
    );
});

export default ControlPanelComponent;
