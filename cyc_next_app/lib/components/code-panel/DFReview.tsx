import React, { Fragment } from "react";
import { IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useDispatch, useSelector } from "react-redux";
import { setReview } from "../../../redux/reducers/DataFramesRedux";
import {
    IDFUpdatesReview,
    IReviewRequest,
    ReviewRequestType,
    UndefReviewIndex,
} from "../../interfaces/IApp";
import store, { RootState } from "../../../redux/store";

const ReviewButton = ({ type, onClick, disabled }) => {
    return (
        <IconButton
            onClick={onClick}
            aria-label='Back'
            size='small'
            color='primary'
            disabled={disabled}
        >
            {type == ReviewRequestType.prev && (
                <ArrowBackIosIcon fontSize='small' style={{ width: "14px", height: "14px" }} />
            )}
            {type == ReviewRequestType.repeat && (
                <FiberManualRecordIcon fontSize='small' style={{ width: "14px", height: "14px" }} />
            )}
            {type == ReviewRequestType.next && (
                <ArrowForwardIosIcon fontSize='small' style={{ width: "14px", height: "14px" }} />
            )}
        </IconButton>
    );
};

const ReviewComponent = ({ activeReview }) => {
    const dispatch = useDispatch();
    //this will be used to set the status of the review buttons
    const dfReview: IDFUpdatesReview = useSelector((state: RootState) => get_review_request(state));

    function get_review_request(state: RootState): IDFUpdatesReview {
        const activeDataFrame = state.dataFrames.activeDataFrame;
        return state.dataFrames.dfUpdatesReview[activeDataFrame];
    }

    function onClick(type: ReviewRequestType) {
        let review: IReviewRequest = { type: type, index: UndefReviewIndex };
        let state = store.getState();
        console.log(
            "ReviewComponent: ",
            state.dataFrames.dfUpdatesReview[state.dataFrames.activeDataFrame]
        );
        dispatch(setReview(review));
    }

    return (
        <Fragment>
            {console.log("Render ReviewComponent")}
            {activeReview && dfReview ? (
                <Fragment>
                    <ReviewButton
                        onClick={() => onClick(ReviewRequestType.prev)}
                        type={ReviewRequestType.prev}
                        disabled={dfReview.index == 0}
                    />
                    <ReviewButton
                        onClick={() => onClick(ReviewRequestType.repeat)}
                        type={ReviewRequestType.repeat}
                        disabled={false}
                    />
                    <ReviewButton
                        onClick={() => onClick(ReviewRequestType.next)}
                        type={ReviewRequestType.next}
                        disabled={dfReview.index == dfReview.length - 1}
                    />
                </Fragment>
            ) : null}
        </Fragment>
    );
};

export default ReviewComponent;
