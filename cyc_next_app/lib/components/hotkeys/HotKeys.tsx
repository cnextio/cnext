import React from "react";
import Hotkeys from "react-hot-keys";
import store from "../../../redux/store";

export default class HotkeysComponent extends React.Component {
    constructor(props) {
        super(props);

        let state = store.getState();
        let appShortcut = state.projectManager.configs.app_shortcut;
        let appShortcutList = [];
        for (let value of Object.values(appShortcut)) {
            appShortcutList.push(value);
        }
        this.state = {
            hotKeys: appShortcutList.join(","),
        };
    }

    onKeyUp(keyName, e, handle) {
        console.log("test:onKeyUp", keyName, e, handle);
    }

    onKeyDown(keyName, e, handle) {
        console.log("test:onKeyDown", keyName, e, handle);
    }

    render() {
        return (
            <Hotkeys
                keyName={this.state.hotKeys}
                onKeyDown={this.onKeyDown.bind(this)}
                onKeyUp={this.onKeyUp.bind(this)}
            ></Hotkeys>
        );
    }
}
