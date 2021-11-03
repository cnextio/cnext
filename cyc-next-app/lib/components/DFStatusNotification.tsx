import * as React from 'react';
import Alert from '@mui/material/Alert';
import { ToastContainer, toast, cssTransition } from 'react-toastify';
import "animate.css/animate.min.css";
// import 'animate.css'
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { UpdateType } from './Interfaces';
import { Fragment, useEffect } from 'react';
import store from '../../redux/store';
import { StyledDFStatusNotification as DFStatusNotificationContainer } from './StyledComponents';
import { emptyString, ifElse } from './libs';
import { Typography } from '@mui/material';



export default function DFStatusNotification() {
    const dataFrameUpdates = useSelector((state) => state.dataFrames.dataFrameUpdates);
    const MAX_ELEM_COUNT_TO_SHOW = 5;
    const _getElementComponent = (updateElements: Array<any>) => {
        return (
            <Fragment>
                {updateElements.map((elem, index) => (
                    <Fragment>
                        <Typography variant='caption' component='span' style={{fontWeight: 'bold'}}>                    
                            {elem}
                        </Typography>
                        {/* <Typography component = 'span'>                     */}
                        {index < updateElements.length-1 ? ", " : " "}
                        {/* </Typography> */}
                    </Fragment>
                ))}
            </Fragment>           
        );
    }
    const _getMessageComponent = (updateType: UpdateType, updateElements: Array<any>) => {
        let message = null;
        let showElement = (updateElements.length<=MAX_ELEM_COUNT_TO_SHOW);
        const activityText = {
            'add_cols': 'added',
            'del_cols': 'removed'            
        };        
        if (updateElements.length>0){  
            message = (                            
                <Fragment>
                    {showElement
                    ? <Fragment> Column {_getElementComponent(updateElements)} {activityText[updateType]} </Fragment> 
                    : <Fragment> {updateElements.length} columns {activityText[updateType]} </Fragment>}
                </Fragment>                            
            );            
        }        
        return message;
    }

    useEffect(() => {
        const state = store.getState();
        const activeDataFrame = state.dataFrames.activeDataFrame;
        const activeDataFrameUpdates = dataFrameUpdates[activeDataFrame]
        if (activeDataFrame != null){            
            const updateType = ifElse(activeDataFrameUpdates, 'update_type', null);
            const update_content = ifElse(activeDataFrameUpdates, 'update_content', []);

            let message = _getMessageComponent(updateType, update_content);
            if (message != null) {                
                toast(message);
            }            
        }
    }, [dataFrameUpdates])

    const bounce = cssTransition({
        enter: "animate__animated animate__fadeIn",
        exit: "animate__animated animate__fadeOut"
    });

    return (
        <DFStatusNotificationContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            transition={bounce}
            bodyClassName='notif-text'
            closeButton={false}
        />
    );
}