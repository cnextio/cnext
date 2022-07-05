import React, { Fragment, useEffect, useRef, useState } from "react";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";
import {
    CodeOutputContainer,
    CodeOutputHeaderText,
    CodeOutputContent,
    IndividualCodeOutputContent,
    CodeOutputHeader,
} from "../StyledComponents";
import { Box, Typography } from "@mui/material";
import { DataFrameUpdateType, IDataFrameStatus } from "../../interfaces/IDataFrameStatus";
import { useDispatch, useSelector } from "react-redux";
import ReviewComponent from "./DFReview";
import Ansi from "ansi-to-react";
import { ICodeLine, ICodeResultContent } from "../../interfaces/ICodeEditor";
import store, { RootState } from "../../../redux/store";
import { getLastUpdate } from "../dataframe-manager/libDataFrameManager";
import { setDFStatusShowed } from "../../../redux/reducers/DataFramesRedux";

export type ITextOuput = {
    type: string;
    content?: string;
    groupID: string;
    lineID: string;
};

const CodeOutputComponent = React.memo(() => {
    const activeDFStatus = useSelector((state: RootState) => getActiveDataFrameStatus(state));
    const dispatch = useDispatch();
    // const dfUpdateCount = useSelector((state: RootState) => state.dataFrames.dfUpdateCount);
    /** this will make sure that the output will be updated each time
     * the output is updated from server such as when inViewID changed */
    const serverSynced = useSelector((state: RootState) => state.projectManager.serverSynced);
    const textOutputUpdateCount = useSelector(
        (state: RootState) => state.codeEditor.textOutputUpdateCount
    );
    const roTextOutputUpdateCount = useSelector(
        (state: RootState) => state.richOutput.textOutputUpdateCount
    );
    // const richOutputFocused = useSelector((state: RootState) => state.richOutput.richOutputFocused);
    const activeGroup = useSelector((state: RootState) => state.codeEditor.activeGroup);
    const activeLine = useSelector((state: RootState) => state.codeEditor.activeLine);
    /** use this to reload the output when inViewID changed */
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    const [outputContent, setOutputContent] = useState<(ITextOuput | undefined)[]>([]);
    const [lastItemIsROTextOutput, setLastItemIsROTextOutput] = useState<boolean>(false);
    // const codeOutputRef = useRef(null);

    function getOrderedTextOuput(state: RootState): (ITextOuput | undefined)[] {
        const inViewID = state.projectManager.inViewID;
        const groupIDSet = new Set();
        if (inViewID != null) {
            let textOutputs = state.codeEditor.codeLines[inViewID]
                ?.filter((codeLine: ICodeLine) => {
                    /** only display one text output in a group like jupyter notebook */
                    if (codeLine.groupID == null) {
                        return codeLine.textOutput != null; //true; //codeLine.textOutput != null;
                    } else if (!groupIDSet.has(codeLine.groupID)) {
                        groupIDSet.add(codeLine.groupID);
                        return codeLine.textOutput != null; //true; //codeLine.textOutput != null
                    } else {
                        return false;
                    }
                })
                // .sort((item1: ICodeLine, item2: ICodeLine) => {
                //     if (item1.textOutput?.order != null && item2.textOutput?.order != null) {
                //         return item1.textOutput?.order - item2.textOutput?.order;
                //     } else {
                //         return -1;
                //     }
                // })
                .map((item: ICodeLine) => {
                    // return item.textOutput?.content;
                    return {
                        type: "text",
                        content:
                            item.textOutput?.content == null || item.textOutput?.content === ""
                                ? "\n"
                                : item.textOutput?.content,
                        groupID: item.groupID,
                        lineID: item.lineID,
                    } as ITextOuput;
                });
            return textOutputs;
        } else {
            return [];
        }
    }

    function getActiveDataFrameStatus(state: RootState) {
        const activeDataFrame = state.dataFrames.activeDataFrame;
        if (
            activeDataFrame &&
            state.dataFrames.dfUpdates != null &&
            activeDataFrame in state.dataFrames.dfUpdates
        ) {
            // console.log('Check update: ', state.dataFrames.dfUpdates[activeDataFrame]);
            const activeDataFrameStatus = state.dataFrames.dfUpdates[activeDataFrame];
            if (activeDataFrameStatus.is_updated && !activeDataFrameStatus.is_showed) {
                return activeDataFrameStatus;
            }
        }
        return null;
    }

    const activityText = {
        add_cols: "added",
        del_cols: "removed",
        add_rows: "added",
        del_rows: "removed",
        update_cells: "updated",
    };

    const updateTypeToReview = ["add_cols", "add_rows", "update_cells"];

    const buildUpdatedItemsComponent = (updatedItems: Array<any>) => {
        return (
            <Fragment>
                {updatedItems.map((elem, index) => (
                    <Fragment>
                        <Typography
                            key={index}
                            variant="caption"
                            component="span"
                            style={{ fontWeight: "bold" }}
                        >
                            {elem}
                        </Typography>
                        {index < updatedItems.length - 1 ? ", " : " "}
                    </Fragment>
                ))}
            </Fragment>
        );
    };

    const renderDFReviewsOutputComponent = (
        key: number,
        updateType: DataFrameUpdateType,
        updatedItems: Array<any>,
        activeReview: boolean
    ) => {
        return (
            <Fragment>
                {updateType === DataFrameUpdateType.new_df && (
                    <Fragment>New dataframe created</Fragment>
                )}
                {updateType !== DataFrameUpdateType.new_df &&
                (updatedItems.length || Object.keys(updatedItems).length) ? (
                    <Box key={key} sx={{ display: "flex" }}>
                        <Box>
                            {/* {console.log('Show ouput:', updateType, updatedItems, activeReview)} */}
                            {(updateType == DataFrameUpdateType.add_cols ||
                                updateType == DataFrameUpdateType.del_cols) && (
                                <Fragment>
                                    Column{updatedItems.length > 1 ? "s" : ""}{" "}
                                    {buildUpdatedItemsComponent(updatedItems)}{" "}
                                    {activityText[updateType]}
                                </Fragment>
                            )}
                            {(updateType == DataFrameUpdateType.add_rows ||
                                updateType == DataFrameUpdateType.del_rows) && (
                                <Fragment>
                                    Row{updatedItems.length > 1 ? "s" : ""}{" "}
                                    {buildUpdatedItemsComponent(updatedItems)}{" "}
                                    {activityText[updateType]}
                                </Fragment>
                            )}
                            {updateType == DataFrameUpdateType.update_cells && (
                                <Fragment>
                                    {/* {updatedItems.length} cell{updatedItems.length>1 ? 's' : ''} {activityText[updateType]}  */}
                                    Cell(s) {activityText[updateType]}
                                </Fragment>
                            )}
                        </Box>
                        <Box sx={{ flexGrow: 1, textAlign: "right" }}>
                            <ReviewComponent
                                // key={key}
                                // content={updatedItems}
                                activeReview={activeReview}
                            />
                        </Box>
                    </Box>
                ) : null}
            </Fragment>
        );
    };

    /** Get an ordered code execution text outputs and set the state */
    const handleTextOutput = () => {
        if (serverSynced) {
            try {
                const state: RootState = store.getState();
                let textOutputs = getOrderedTextOuput(state);
                setOutputContent(textOutputs);
                setLastItemIsROTextOutput(false);
            } catch (error) {
                // TODO: process json error
                console.error(error);
            }
        }
    };
    useEffect(handleTextOutput, [textOutputUpdateCount, serverSynced, inViewID]);

    /** Get an df update messages */
    const handleDFUpdates = () => {
        // const state = store.getState();
        // const activeDFStatus = getActiveDataFrameStatus(state);
        //TODO: handle situation when dataFrameUpdates is cleared, should not rerender in that case
        if (activeDFStatus != null) {
            const update = getLastUpdate(activeDFStatus);
            // dfUpdates._status_list[dfUpdates._status_list.length-1].updates;
            const updateType = update.update_type;
            const updateContent = update.update_content ? update.update_content : [];

            let newOutputContent = {
                type: "df_updates",
                content: {
                    updateType: updateType,
                    updateContent: updateContent,
                },
            };
            //_getDFUpdatesOutputComponent(outputContent.length, updateType, updateContent);
            if (newOutputContent != null) {
                setOutputContent((outputContent) => [...outputContent, newOutputContent]);
                setLastItemIsROTextOutput(false);
            }
            dispatch(setDFStatusShowed(true));
        }
    };
    useEffect(handleDFUpdates, [activeDFStatus]);

    /** This is to display the text output (often it is an exception)
     * from the excution of plugins in rich-output panel
     * Only keep the last richout put text
     */
    const handleROTextOutput = () => {
        const state = store.getState();
        const newOutputContent: ITextOuput = {
            type: "text",
            content: state.richOutput.textOutput,
        };
        if (!lastItemIsROTextOutput) {
            /** append to the last item */
            setOutputContent((outputContent) => [...outputContent, newOutputContent]);
            setLastItemIsROTextOutput(true);
        } else {
            /** update the last item */
            setOutputContent((outputContent) => [
                ...outputContent.filter((item, index) => index < outputContent.length - 1),
                newOutputContent,
            ]);
        }
    };
    useEffect(() => {
        const state = store.getState();
        if (state.projectManager.settings.dataframe_manager.show_exec_text) {
            handleROTextOutput();
        }
    }, [roTextOutputUpdateCount]);

    const isItemFocused = (item: ITextOuput | undefined, lastItem: boolean) => {
        // TODO: implement scoll to rich-output text and df updates
        // return item?.groupID != null ? item?.groupID === activeGroup : item?.lineID === activeLine;        
        let richOutputFocused = store.getState().richOutput.richOutputFocused;
        console.log(
            "CodeOutput isItemFocused: ",
            richOutputFocused,
            lastItemIsROTextOutput,
            lastItem
        );
        return richOutputFocused && lastItemIsROTextOutput && lastItem
            ? true
            : item?.groupID != null
            ? item?.groupID === activeGroup
            : item?.lineID === activeLine;
    };

    const codeOutputContentID = "CodeOutputContent";
    return (
        <CodeOutputContainer>
            {console.log("Render CodeOutputAreaComponent")}
            <CodeOutputHeader>
                <CodeOutputHeaderText variant="overline" component="span">
                    Console
                </CodeOutputHeaderText>
            </CodeOutputHeader>
            <CodeOutputContent id={codeOutputContentID}>
                {outputContent?.map((item, index) => (
                    <ScrollIntoViewIfNeeded
                        active={isItemFocused(item, index === outputContent.length - 1)}
                        options={{
                            block: "start",
                            inline: "center",
                            behavior: "smooth",
                            boundary: document.getElementById(codeOutputContentID),
                        }}
                    >
                        {item?.type === "text" && (
                            <IndividualCodeOutputContent
                                key={index}
                                component="pre"
                                variant="body2"
                                focused={isItemFocused(item, index === outputContent.length - 1)}
                            >
                                <Ansi>{item.content}</Ansi>
                            </IndividualCodeOutputContent>
                        )}
                        {item?.type === "df_updates" && (
                            <IndividualCodeOutputContent
                                key={index}
                                component="pre"
                                variant="body2"
                            >
                                {renderDFReviewsOutputComponent(
                                    outputContent.length,
                                    item["content"]["updateType"],
                                    item["content"]["updateContent"],
                                    // only the last item and in the review list can be in active review mode
                                    index === outputContent.length - 1 &&
                                        updateTypeToReview.includes(item["content"]["updateType"])
                                )}
                            </IndividualCodeOutputContent>
                        )}
                    </ScrollIntoViewIfNeeded>
                ))}
            </CodeOutputContent>
        </CodeOutputContainer>
    );
});

export default CodeOutputComponent;
