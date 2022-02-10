import { Box, Popover } from "@mui/material";
import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import {
    StyledTableViewHeader,
    TableShape,
    RichOuputViewHeaderButton,
    GridViewBtn,
} from "../StyledComponents";
import { RichOutputViewHeader } from "../../interfaces/IRichOuputViewer";
import GridViewIcon from "@mui/icons-material/GridView";
import { GridViewStatus } from "./data-panel/GridView";
import GridOnIcon from "@mui/icons-material/GridOn";

const RichOuputViewHeader = ({
    show,
    setShow,
    gridViewStatus,
    handleGridViewBtn,
}) => {
    // const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    // const dfMetadata = useSelector((state) => state.dataFrames.metadata[activeDataFrame]);

    return (
        <Fragment>
            {console.log("Render RichOuputViewHeader ")}
            <StyledTableViewHeader>
                {Object.values(RichOutputViewHeader).map((name, index) => (
                    <RichOuputViewHeaderButton
                        selected={show == name ? true : false}
                        variant="overline"
                        component="span"
                        onClick={() => setShow(name)}
                    >
                        {name}
                    </RichOuputViewHeaderButton>
                ))}
                {gridViewStatus != GridViewStatus.NONE && (
                    <GridViewBtn
                        selected={gridViewStatus == GridViewStatus.SELECTED}
                        onClick={() => handleGridViewBtn()}
                    >
                        <GridOnIcon sx={{ fontSize: "20px" }} />
                    </GridViewBtn>
                )}
                {/* {dfMetadata?                      
                <TableShape variant='subtitle'>
                    Shape: {dfMetadata.shape[0]}x{dfMetadata.shape[1]}
                </TableShape>
                : null} */}
            </StyledTableViewHeader>
        </Fragment>
    );
};

export default RichOuputViewHeader;
