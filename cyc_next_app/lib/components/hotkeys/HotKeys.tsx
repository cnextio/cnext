import React from "react";
import Hotkeys from "react-hot-keys";
import { RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setProjectConfig } from "../../../redux/reducers/ProjectManagerRedux";

const HotkeysComponent = () => {
    let configs = useSelector((state: RootState) => state.projectManager.configs);
    const dispath = useDispatch();

    let appShortcutList = [];
    for (let value of Object.values(configs.app_shortcut || [])) {
        appShortcutList.push(value);
    }
    let hotKeys = appShortcutList.join(",");

    const onKeyUp = (keyName, e, handle) => {
        console.log("App shortcut:onKeyUp", keyName, e, handle);
    };

    const onKeyDown = (keyName, e, handle) => {
        // console.log('App shortcut:onKeyDown', keyName, e, handle);
        for (const [key, value] of Object.entries(configs.app_shortcut || [])) {
            let valueStr = value.replaceAll(" ", "");

            if (keyName.toString() == valueStr) {
                procressChange(key);
            }
        }
    };

    const procressChange = (type: string) => {
        let updateObj = { ...configs.code_editor };

        switch (type) {
            case "lint_tooggle":
                updateObj = {
                    ...configs.code_editor,
                    lint: configs.code_editor.lint ? false : true,
                };
                break;

            case "autocompletion_tooggle":
                updateObj = {
                    ...configs.code_editor,
                    autocompletion: configs.code_editor.autocompletion ? false : true,
                    hover: configs.code_editor.hover ? false : true,
                };
                break;

            default:
        }

        dispath(
            setProjectConfig({
                code_editor: {
                    ...updateObj,
                },
            })
        );
    };

    return <Hotkeys keyName={hotKeys} onKeyDown={onKeyDown} onKeyUp={onKeyUp}></Hotkeys>;
};

export default HotkeysComponent;
