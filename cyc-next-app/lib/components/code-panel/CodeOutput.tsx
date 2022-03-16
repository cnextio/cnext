import React, { Fragment, useEffect, useRef, useState } from "react";
import ScrollIntoViewIfNeeded from "react-scroll-into-view-if-needed";
import {
    CodeOutputContainer,
    CodeOutputHeader,
    CodeOutputContent,
    IndividualCodeOutputContent,
} from "../StyledComponents";
import { Box, Typography } from "@mui/material";
import { UpdateType } from "../../interfaces/IApp";
import { useDispatch, useSelector } from "react-redux";
import ReviewComponent from "./DFReview";
import Ansi from "ansi-to-react";
import { ICodeLine, ICodeResultContent } from "../../interfaces/ICodeEditor";
import store, { RootState } from "../../../redux/store";

const CodeOutputComponent = ({ codeOutput }) => {
    const dfUpdates = useSelector((state: RootState) => checkDFUpdates(state));
    // const textOutput = useSelector((state: RootState) => getTextOuput(state));
    const textOutputCount = useSelector(
        (state: RootState) => state.codeEditor.textOutputCount
    );
    let [outputContent, setOutputContent] = useState<{}[]>([]);
    const codeOutputRef = useRef(null);

    function getTextOuput(state: RootState): (ICodeResultContent | undefined)[] {
        const inViewID = state.projectManager.inViewID;
        if (inViewID != null) {
            let textOutputs = state.codeEditor.codeLines[inViewID]
                ?.filter((item: ICodeLine) => {
                    return item.textOutput != null;
                })
                .sort((item1: ICodeLine, item2: ICodeLine) => {
                    if (
                        item1.textOutput?.resultOrder != null &&
                        item2.textOutput?.resultOrder != null
                    ) {
                        return (
                            item1.textOutput?.resultOrder -
                            item2.textOutput?.resultOrder
                        );
                    } else {
                        return -1;
                    }
                })
                .map((item: ICodeLine) => {
                    // return item.textOutput?.content;
                    return {
                        type: "text",
                        content: item.textOutput?.content,
                    };
                });
            console.log(
                "CodeOutput: ",
                state.codeEditor.codeLines[inViewID]?.filter(
                    (item: ICodeLine) => {
                        return item.textOutput != null;
                    }
                )
            );
            return textOutputs;
        } else {
            return [];
        }
    }

    function checkDFUpdates(state: RootState) {
        const activeDataFrame = state.dataFrames.activeDataFrame;
        if (
            activeDataFrame &&
            state.dataFrames.dfUpdates != {} &&
            activeDataFrame in state.dataFrames.dfUpdates
        ) {
            // console.log('Check update: ', state.dataFrames.dfUpdates[activeDataFrame]);
            const activeDataFrameUpdates =
                state.dataFrames.dfUpdates[activeDataFrame];
            if ("update_type" in activeDataFrameUpdates) {
                return activeDataFrameUpdates;
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

    const buildDFReviewsOutputComponent = (
        key: number,
        updateType: UpdateType,
        updatedItems: Array<any>,
        activeReview: boolean
    ) => {
        return (
            <Fragment>
                {updateType === UpdateType.new_df && (
                    <Fragment>New dataframe created</Fragment>
                )}
                {updateType !== UpdateType.new_df &&
                (updatedItems.length || Object.keys(updatedItems).length) ? (
                    <Box key={key} sx={{ display: "flex" }}>
                        <Box>
                            {/* {console.log('Show ouput:', updateType, updatedItems, activeReview)} */}
                            {(updateType == UpdateType.add_cols ||
                                updateType == UpdateType.del_cols) && (
                                <Fragment>
                                    Column{updatedItems.length > 1 ? "s" : ""}{" "}
                                    {buildUpdatedItemsComponent(updatedItems)}{" "}
                                    {activityText[updateType]}
                                </Fragment>
                            )}
                            {(updateType == UpdateType.add_rows ||
                                updateType == UpdateType.del_rows) && (
                                <Fragment>
                                    Row{updatedItems.length > 1 ? "s" : ""}{" "}
                                    {buildUpdatedItemsComponent(updatedItems)}{" "}
                                    {activityText[updateType]}
                                </Fragment>
                            )}
                            {updateType == UpdateType.update_cells && (
                                <Fragment>
                                    {/* {updatedItems.length} cell{updatedItems.length>1 ? 's' : ''} {activityText[updateType]}  */}
                                    Cell(s) {activityText[updateType]}
                                </Fragment>
                            )}
                        </Box>
                        <Box sx={{ flexGrow: 1, textAlign: "right" }}>
                            <ReviewComponent
                                key={key}
                                content={updatedItems}
                                activeReview={activeReview}
                            />
                        </Box>
                    </Box>
                ) : null}
            </Fragment>
        );
    };

    // const handleNormalCodeOutput = () => {
    //     try {
    //         if (codeOutput.content !== null && codeOutput.content !== "") {
    //             let newOutputContent = {
    //                 type: !codeOutput.error ? "text" : "error",
    //                 content: codeOutput.content,
    //             };
    //             setOutputContent((outputContent) => [
    //                 ...outputContent,
    //                 newOutputContent,
    //             ]);
    //         }
    //     } catch (error) {
    //         // TODO: process json error
    //         console.error(error);
    //     }
    // };
    // useEffect(handleNormalCodeOutput, [codeOutput]);

    const handleNormalCodeOutput = () => {
        const state: RootState = store.getState();        
        try {
            let textOutputs = getTextOuput(state);
            console.log("CodeOutput: ", textOutputs);
            setOutputContent(textOutputs);
        } catch (error) {
            // TODO: process json error
            console.error(error);
        }
    };
    useEffect(handleNormalCodeOutput, [textOutputCount]);

    const handleDFUpdates = () => {
        //TODO: handle situation when dataFrameUpdates is cleared, should not rerender in that case
        // const state = store.getState();
        // const activeDataFrame = state.dataFrames.activeDataFrame;
        if (dfUpdates != null) {
            const activeDataFrameUpdates = dfUpdates; //[activeDataFrame];
            const updateType = activeDataFrameUpdates.update_type;
            const updateContent = activeDataFrameUpdates.update_content
                ? activeDataFrameUpdates.update_content
                : [];

            let newOutputContent = {
                type: "df_updates",
                content: {
                    updateType: updateType,
                    updateContent: updateContent,
                },
            };
            //_getDFUpdatesOutputComponent(outputContent.length, updateType, updateContent);
            if (newOutputContent != null) {
                setOutputContent((outputContent) => [
                    ...outputContent,
                    newOutputContent,
                ]);
            }
        }
    };
    useEffect(handleDFUpdates, [dfUpdates]);

    // const _setTimeoutToUnlockScroll = () => {
    //     /*
    //     * We use this scroll lock and timeout to make sure this and TableComponent can scroll to view
    //     * at the same time. This is very ugly solution for this problem. The current assumption is this will
    //     * scroll first.
    //     * https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
    //     */
    //     if (codeOutputRef.current){
    //         let scrollTimeout;
    //         codeOutputRef.current.addEventListener('scroll', function(e) {
    //             clearTimeout(scrollTimeout);
    //             scrollTimeout = setTimeout(function() {
    //                 dispatch(scrollUnlock());
    //             }, 50);
    //         });
    //         // have to set this outside as well to handle the case where there is no scroll
    //         scrollTimeout = setTimeout(function() {
    //             dispatch(scrollUnlock());
    //         }, 200); //TODO: the latency here is pretty high, but it does not work with lower number.
    //                  // need to figure out a better way to handle this no scroll event.
    //     }
    // }

    // const scrollToBottom = () => {
    //     // need block and inline property because of this
    //     // https://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move/11041376
    //     if(endPointRef.current){
    //         // see: https://stackoverflow.com/questions/46795955/how-to-know-scroll-to-element-is-done-in-javascript
    //         dispatch(scrollLock());
    //         endPointRef.current.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start' });
    //         _setTimeoutToUnlockScroll();
    //     }
    // }
    // useEffect(scrollToBottom, [outputContent]);
    const codeOutputContentID = "CodeOutputContent";
    return (
        <CodeOutputContainer>
            {console.log("Render CodeOutputAreaComponent")}
            <CodeOutputHeader variant="overline" component="span">
                Output
            </CodeOutputHeader>
            <CodeOutputContent ref={codeOutputRef} id={codeOutputContentID}>
                {outputContent.map((item, index) => (
                    <Fragment>
                        {item["type"] === "text" && item["content"] !== "" && (
                            <IndividualCodeOutputContent
                                key={index}
                                component="pre"
                                variant="body2"
                            >
                                <Ansi>{item["content"]}</Ansi>
                            </IndividualCodeOutputContent>
                        )}
                        {item["type"] === "df_updates" && (
                            <IndividualCodeOutputContent
                                key={index}
                                component="pre"
                                variant="body2"
                            >
                                {buildDFReviewsOutputComponent(
                                    outputContent.length,
                                    item["content"]["updateType"],
                                    item["content"]["updateContent"],
                                    // only the last item and in the review list can be in active review mode
                                    index === outputContent.length - 1 &&
                                        updateTypeToReview.includes(
                                            item["content"]["updateType"]
                                        )
                                )}
                            </IndividualCodeOutputContent>
                        )}
                        {/* {item["type"] === "error" &&
                            typeof item["content"] === "object" &&
                            item["content"].map((content) => (
                                <IndividualCodeOutputContent
                                    key={index}
                                    component="pre"
                                    variant="body2"
                                >
                                    <Ansi>{content.toString()}</Ansi>
                                </IndividualCodeOutputContent>
                            ))} */}
                        {index === outputContent.length - 1 && (
                            <ScrollIntoViewIfNeeded
                                options={{
                                    active: true,
                                    block: "nearest",
                                    inline: "center",
                                    behavior: "smooth",
                                    boundary:
                                        document.getElementById(
                                            codeOutputContentID
                                        ),
                                }}
                            />
                        )}
                    </Fragment>
                ))}
            </CodeOutputContent>
        </CodeOutputContainer>
    );
};

export default CodeOutputComponent;
