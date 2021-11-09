import React, { Fragment, useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useDispatch, useSelector } from "react-redux";
import { setReview } from "../../redux/reducers/dataFrameSlice";
import { IDFUpdatesReview, IReviewRequest, ReviewRequestType, UndefReviewIndex } from "./AppInterfaces";
import store from "../../redux/store";
import { ifElse } from "./libs";

export enum ReviewType {
    back = 'back',
    current = 'current',
    next = 'next'
}

const ReviewButton = ({type, onClick, disabled}) => {
    return (
        <IconButton onClick={onClick} aria-label="Back" size="small" color='primary' disabled={disabled}>
            {type==ReviewType.back && <ArrowBackIosIcon fontSize="small" style={{width: '14px', height: '14px'}}/>}
            {type==ReviewType.current && <FiberManualRecordIcon fontSize="small" style={{width: '14px', height: '14px'}}/>}
            {type==ReviewType.next && <ArrowForwardIosIcon fontSize="small" style={{width: '14px', height: '14px'}}/>}
        </IconButton>
    )
}

const ReviewComponent = ({key, content, activeReview}) => {
    const dispatch = useDispatch();
    //this will be used to set the status of the review buttons
    const dfReview: IDFUpdatesReview = useSelector((state) => _get_review_request(state));

    function _get_review_request(state): IDFUpdatesReview {
        const activeDataFrame = state.dataFrames.activeDataFrame;        
        return ifElse(state.dataFrames.dfUpdatesReview, activeDataFrame, null);
    }

    function onClick(type: ReviewType){        
        if (type == ReviewType.current){            
            let review: IReviewRequest = {type: ReviewRequestType.repeat, index: UndefReviewIndex}
            dispatch(setReview(review));
        }
    }

    return (        
        <Fragment>
            {console.log('Render ReviewComponent')}
            {activeReview && dfReview ?
            <Fragment>
                <ReviewButton onClick={() => onClick(ReviewType.back)} type={ReviewType.back} disabled={dfReview.index==0}/>
                <ReviewButton onClick={() => onClick(ReviewType.current)} type={ReviewType.current} disabled={false}/>
                <ReviewButton onClick={() => onClick(ReviewType.next)} type={ReviewType.next} disabled={dfReview.index==dfReview.length-1}/>            
            </Fragment> : null}
        </Fragment> 
        
    )
}

export default ReviewComponent;