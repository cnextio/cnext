import { Typography } from "@mui/material";
import React, { Fragment, useEffect } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";
import { setActiveModel } from "../../../../redux/reducers/ModelManagerRedux";
import store, { RootState } from "../../../../redux/store";
import {
    DFSelector as ModelSelector,
    DFSelectorForm as ModelSelectorForm,
    SmallArrowIcon,
    DFSelectorMenuItem as ModelSelectorMenuItem,
} from "../../StyledComponents";

const ModelExplorer = () => {
    const modelInfo = useSelector((state: RootState) => state.modelManager.modelInfo);
    const dispatch = useDispatch();

    useEffect(() => {}, []);

    function handleChange({ target }) {
        // console.log('Handle change: ', target);
        dispatch(setActiveModel(target.value));
    }

    const createComponent = () => {
        const state = store.getState();
        let activeModel = state.modelManager.activeModel;
        let modelNameList = Object.keys(modelInfo);
        return (
            <ModelSelectorForm>
                <ModelSelector
                    onChange={handleChange}
                    value={activeModel != null ? activeModel : ""}
                    IconComponent={SmallArrowIcon}
                    SelectDisplayProps={{
                        style: { padding: "0px 10px", lineHeight: "35px" },
                    }}
                    // displayEmpty = {true}
                    renderValue={() => {
                        return (
                            <Fragment>
                                {activeModel != null ? (
                                    <Typography height="100%" variant="caption" fontSize="14px">
                                        {activeModel}
                                    </Typography>
                                ) : (
                                    <Typography
                                        height="100%"
                                        variant="caption"
                                        fontSize="12px"
                                        color="#BFC7CF"
                                    >
                                        Model
                                    </Typography>
                                )}
                            </Fragment>
                        );
                    }}
                >
                    {modelNameList &&
                        modelNameList.map((item, index) => (
                            <ModelSelectorMenuItem value={item}>{item}</ModelSelectorMenuItem>
                        ))}
                </ModelSelector>
            </ModelSelectorForm>
        );
    };

    return createComponent();
};

export default ModelExplorer;
