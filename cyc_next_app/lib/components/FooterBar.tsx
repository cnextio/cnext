import React, { useEffect, useState } from "react";
import { FooterNavigation, FooterItem, FotterItemText } from "./StyledComponents";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setProjectConfig } from "../../redux/reducers/ProjectManagerRedux";

const FooterBarComponent = () => {
    const [config, setConfig] = useState({ lint: false, hover: false, autocompletion: false });

    const rootConfig = useSelector(
        (rootState: RootState) => rootState.projectManager.configs.code_editor
    );
    const dispatch = useDispatch();

    const procressChange = (type: string) => {
        let updateObj = { ...config };
        switch (type) {
            case "lint":
                updateObj = { ...config, lint: config.lint ? false : true };
                break;
            case 'autocompletion':
                updateObj = {
                    ...config,
                    autocompletion: config.autocompletion ? false : true,
                    hover: config.hover ? false : true,
                };
                break;

            default:
        }

        dispatch(
            setProjectConfig({
                code_editor: {
                    ...updateObj,
                },
            })
        );
    };

    useEffect(() => {
        setConfig({ ...rootConfig });
    }, [rootConfig]);

    return (
        <FooterNavigation>
            <FooterItem>
                <FotterItemText
                    onClick={() => {
                        procressChange("autocompletion");
                    }}
                >
                    Autocompletion: {config.autocompletion ? "ON" : "OFF"}
                </FotterItemText>
            </FooterItem>
            <FooterItem>
                <FotterItemText
                    onClick={() => {
                        procressChange("lint");
                    }}
                >
                    Code Analysis: {config.lint ? "ON" : "OFF"}
                </FotterItemText>
            </FooterItem>
        </FooterNavigation>
    );
};

export default FooterBarComponent;
