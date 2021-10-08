import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import styled, {withTheme} from "styled-components";
// import DashboardLayout from "./dashboard";
// import Helmet from 'react-helmet';
import {
    Card as MuiCard,
    CardContent as MuiCardContent,
    Divider as MuiDivider,
    Grid, IconButton,
} from "@material-ui/core";
// import {spacing} from "@material-ui/system";
// import {
//     COMMON_FOLDER_TITLE,
//     getEmailByUser, getFolderPathFromID,
//     markBacklogContentAsDone,
//     markProposalAsDone
// } from "../../../lib/database";
// import EmailContent from "./text-contents";
// import {TextContentWithInlineProposal} from "./text-contents"
// import TaskProposalContainer from "./task-proposals";
import {useEffect} from "react";
// import {apolloClient, getFolderPathFromChips} from "../../../lib/database";
// import CircularProgress from "@material-ui/core/CircularProgress";
// import Alert from "@material-ui/lab/Alert";
// import AlertTitle from "@material-ui/lab/AlertTitle";
// import {useMutation, useQuery} from "@apollo/client";
// import {FolderTitleContainer} from "./folder-title";
import Paper from "@material-ui/core/Paper";
// import paper from 'paper';
// import {Path, Point} from 'paper';

// import socketIOClient from "socket.io-client";
import {BorderInner, Check, Close, PlayArrow, Refresh, Stop} from "@material-ui/icons";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

const SOCKET_ENDPOINT = "http://localhost:4001";
// const socket = socketIOClient.io(SOCKET_ENDPOINT);

let calibCorners = [];
let calibPoint = null;
let calibWidth = 0.27382399999999996; // 11"
let calibHeight = 0.21072; // 8.5"
let calibTopLeftX = -0.253169;
let calibTopLeftY = -0.199179;
const n=80;
const CANVAS_SIZE = [n*11, n*8.5];
let pen;
let pointer;
let noPrevData = false;
let drawing = false;
let calibrating = false;
let pointerRadius;

const Sketch = forwardRef((props, ref) => {
    const [penData, setPenData] = useState();
    const maxz=-0.009;
    const minz= maxz-0.002;

    useEffect(() => {
        console.log("Sketch rerendering");
        // paper.setup('paper-canvas');
        const canvas = document.getElementById('paper-canvas');
        const context = canvas.getContext('2d');
        context.canvas.width = CANVAS_SIZE[0];
        context.canvas.height = CANVAS_SIZE[1];

        // const socket = socketIOClient(SOCKET_ENDPOINT);
        // socket.emit("penOn");
        // socket.on("drawIt", (data) => {
        //     console.log("drawIt: " + data);
        //     setPenData(JSON.parse(data));
        // });
    }, []);

    const POINTER_RADIUS=10;
    useEffect(() => {
        let canvasPoint;
        if (penData!=null) {
            console.log("Got penData");
            if (penData.hasData) {
                let newPoint = new Point(penData.pos[0], penData.pos[1]);
                canvasPoint = getCanvasPos(newPoint);
                if (pointer != null) {
                    console.log("pointer: " + canvasPoint);
                    pointer.position = canvasPoint;
                    pointerRadius = pointer.bounds.width / 2;
                    let scale;
                    // if (penData.pos[2]>=maxz){
                    //     scale = Math.min(POINTER_RADIUS, 0.001);
                    // } else {
                    //     scale = Math.min(POINTER_RADIUS, (POINTER_RADIUS - (penData.pos[2] - minz) / (maxz - minz) * POINTER_RADIUS)) / pointerRadius;
                    // }
                    scale = Math.min(POINTER_RADIUS, (POINTER_RADIUS - (Math.min(penData.pos[2], maxz+0.0001) - minz) / (maxz - minz) * POINTER_RADIUS)) / pointerRadius;
                    pointer.scale(scale);
                    pointerRadius = pointer.bounds.width / 2;
                    if(pointerRadius == NaN)
                        pointerRadius = POINTER_RADIUS;
                    console.log("pointer radius: ",pointerRadius);
                } else {
                    pointer = new Path.Circle({
                        center: canvasPoint,
                        radius: 1,
                        strokeColor: 'red'
                    });
                }
            }
            if (drawing) {
                if (penData.hasData && pointerRadius<2.) {
                    if (noPrevData) {
                        noPrevData = false;
                        pen = new Path({strokeColor: 'black'});
                    }
                    console.log("drawing...");
                    if (pen == null)
                        pen = new Path({strokeColor: 'black'});
                    pen.add(canvasPoint);
                } else {
                    noPrevData = true;
                }
            } else if (calibrating) {
                if (penData.hasData) {
                    let newPoint = new Point(penData.pos[0], penData.pos[1]);
                    calibPoint = newPoint;
                } else {
                    calibPoint = null;
                }
            }
        }
    }, [penData]);

    useImperativeHandle(ref, () => ({
        changeCalibState(calibrationState) {
            // socket does not work with state, so have to use global var
            if(calibrationState>0)
                calibrating = true;
            else
                calibrating = false;
        },
        clearCanvas() {
            // const canvas = document.getElementById('paper-canvas');
            // const context = canvas.getContext('2d');
            // context.clearRect(0, 0, canvas.width, canvas.height);
            // paper.project.activeLayer.removeChildren();
            pen = null;
            pointer = null;
        },
        changeDrawingState(drawingState) {
            drawing = drawingState;
            if(!drawing)
                pen = null;
        }
    }));

    const getCanvasPos = (point) => {
        const canvasX = (point.x-calibTopLeftX) / calibWidth * CANVAS_SIZE[0];
        const canvasY = (point.y-calibTopLeftY) / calibHeight * CANVAS_SIZE[1];
        return new Point(canvasX, canvasY);
    }
    return (
        <Paper>
            <canvas id='paper-canvas' width={CANVAS_SIZE[0]} height={CANVAS_SIZE[1]} resize="true"/>
        </Paper>
    );
});

function Toolbar({ changeSketchDrawingState, changeSketchCalibState, clearCanvas }) {
    const [start, setStart] = useState(false);
    const CALIB_STATE = ["Calibration", "Top Left", "Top Right", "Bottom Left"];
    const [calibState, setCalibState] = useState(0);
    const [calibLabel, setCalibLabel] = useState(CALIB_STATE[0]);

    useEffect(() => {
        console.log("Toolbar rerendering");
    });

    useEffect(() => {
        if (calibState>0) {
            setStart(false);
            changeSketchDrawingState(false);
        }
    }, [calibState])

    const onStartStop = () => {
        changeSketchDrawingState(!start);
        setStart(!start);
    }

    const onCalibration = () => {
        let newState = calibState;
        if (newState==0){
            setStart(false);
            // socket.emit("penOn");
            calibCorners = [];
            newState = newState + 1;
            // calibrating = true;
        }
        else {
            if (calibPoint!=null) {
                calibCorners.push(calibPoint);
                newState = newState + 1;
            }
        }
        if (newState%CALIB_STATE.length == 0) {
            newState = 0;
            calibWidth = calibCorners[1].x-calibCorners[0].x;
            calibHeight = calibCorners[2].y-calibCorners[0].y;
            calibTopLeftX = calibCorners[0].x;
            calibTopLeftY = calibCorners[0].y;
            console.log("Calib: ", calibCorners);
            console.log("Calib: ", calibWidth, calibHeight);
            // calibrating = false;
        }
        setCalibState(newState);
        setCalibLabel(CALIB_STATE[newState]);
        changeSketchCalibState(newState);
    }

    return (
        <Box>
            <Button
                variant="contained"
                color="primary"
                onClick={onCalibration}
                children={calibLabel}
            >
            </Button>
            <IconButton
                // className={classes.icon}
                id="start-stop"
                color="secondary"
                onClick={onStartStop}
            >
                {start ? <Stop/> : <PlayArrow/>}
            </IconButton>
            <IconButton
                // className={classes.icon}
                id="reset"
                color="default"
                onClick={clearCanvas}
            >
              <Refresh />
            </IconButton>
        </Box>
    );
}

const  DrawingPageContainer = () => {
    const sketchRef = useRef();

    return (
        <React.Fragment>
            <Toolbar changeSketchDrawingState={(drawingState) => sketchRef.current.changeDrawingState(drawingState)}
                     changeSketchCalibState={(calibState) => sketchRef.current.changeCalibState(calibState)}
                     // onCalibStateChange={onCalibStateChange}
                     clearCanvas={() => sketchRef.current.clearCanvas()}/>
            <Sketch ref={sketchRef}/>
        </React.Fragment>
    );
}

export default withTheme(DrawingPageContainer);


