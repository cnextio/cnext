import React, { useEffect, useState } from "react";
import { FooterNavigation, FooterItem, FotterItemText } from "./StyledComponents";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setProjectSetting } from "../../redux/reducers/ProjectManagerRedux";

const enum FootbarItemName {
    AUTOCOMPLETION = "Autocompletion",
    CODEANALYSIS = "Code Analysis",
    MARKDOWN = "Show Markdown",
}

interface IFootbarItem {
    name: FootbarItemName;
    setting: {};
}

const FooterBarComponent = () => {
    // const [codeEditorConfig, setCodeEditorConfig] = useState({ lint: false, hover: false, autocompletion: false });

    const codeEditorSettings = useSelector(
        (rootState: RootState) => rootState.projectManager.settings.code_editor
    );
    const richOutputSettings = useSelector(
        (rootState: RootState) => rootState.projectManager.settings.rich_output
    );
    const dispatch = useDispatch();

    const footbarItems: IFootbarItem[] = [
        { name: FootbarItemName.AUTOCOMPLETION, setting: codeEditorSettings.autocompletion },
        { name: FootbarItemName.CODEANALYSIS, setting: codeEditorSettings.lint },
        { name: FootbarItemName.MARKDOWN, setting: richOutputSettings.show_markdown },
    ];
    const changeHandler = (type: string) => {
        let updatedSettings = {};//{ ...codeEditorConfig };
        switch (type) {
            case FootbarItemName.CODEANALYSIS:
                updatedSettings = { ...codeEditorSettings, lint: codeEditorSettings.lint ? false : true };
                dispatch(
                    setProjectSetting({
                        code_editor: {
                            ...updatedSettings,
                        },
                    })
                );
                break;
            case FootbarItemName.AUTOCOMPLETION:
                updatedSettings = {
                    ...codeEditorSettings,
                    autocompletion: codeEditorSettings.autocompletion ? false : true,
                    hover: codeEditorSettings.hover ? false : true,
                };
                dispatch(
                    setProjectSetting({
                        code_editor: {
                            ...updatedSettings,
                        },
                    })
                );
                break;
            case FootbarItemName.MARKDOWN:
                updatedSettings = {
                    ...richOutputSettings,
                    show_markdown: richOutputSettings.show_markdown ? false : true,
                };
                dispatch(
                    setProjectSetting({
                        rich_output: {
                            ...updatedSettings,
                        },
                    })
                );
                break;
            default:
        }

        
    };

    return (
        <FooterNavigation>
            {footbarItems.map((item, index)=>{
                return (
                    <FooterItem key={index}>
                        <FotterItemText
                            onClick={() => {
                                changeHandler(item.name);
                            }}
                        >
                            {item.name}: {item.setting ? "ON" : "OFF"}
                        </FotterItemText>
                    </FooterItem>
                );
            })}
        </FooterNavigation>
    );
};

export default FooterBarComponent;
