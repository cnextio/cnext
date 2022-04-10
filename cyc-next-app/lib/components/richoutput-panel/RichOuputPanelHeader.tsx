import React, { Fragment } from "react";
import { StyledTableViewHeader, RichOuputViewHeaderButton, DataPanelToolbarBtn } from "../StyledComponents";
import { RichOutputPanelToolbarItems } from "../../interfaces/IRichOuputViewer";
import { GridViewStatus } from "./data-panel/GridView";
import GridOnIcon from "@mui/icons-material/GridOn";

const RichOuputPanelHeader = ({ show, setShow }) => {
    // const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    // const dfMetadata = useSelector((state) => state.dataFrames.metadata[activeDataFrame]);

    return (
        <Fragment>
            {console.log("Render RichOuputViewHeader ")}
            <StyledTableViewHeader>
                {Object.values(RichOutputPanelToolbarItems).map((name, index) => (
                    <RichOuputViewHeaderButton
                        key={index}
                        selected={show == name ? true : false}
                        variant='overline'
                        component='span'
                        onClick={() => setShow(name)}
                    >
                        {name}
                    </RichOuputViewHeaderButton>
                ))}
            </StyledTableViewHeader>
        </Fragment>
    );
};

export default RichOuputPanelHeader;
