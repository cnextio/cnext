import React, { Fragment } from "react";
import { StyledTableViewHeader, RichOuputViewHeaderButton } from "../StyledComponents";
import { RichOutputPanelToolbarItems } from "../../interfaces/IRichOuputViewer";
import CircleIcon from "@mui/icons-material/Circle";

const RichOuputPanelHeader = ({ newItemIndicator, show, setShow }) => {
    // const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    // const dfMetadata = useSelector((state) => state.dataFrames.metadata[activeDataFrame]);

    return (
        <Fragment>
            {console.log("Render RichOuputViewHeader ")}
            <StyledTableViewHeader>
                {Object.values(RichOutputPanelToolbarItems).map((name, index) => (
                    <RichOuputViewHeaderButton
                        id={"RichOuputViewHeader_" + name}
                        key={index}
                        selected={show == name ? true : false}
                        variant="overline"
                        component="span"
                        onClick={() => setShow(name)}
                    >
                        {name}
                        {newItemIndicator && newItemIndicator === name && newItemIndicator !== show ? (
                            <CircleIcon
                                sx={{
                                    fontSize: "11px",
                                    marginBottom: "2px",
                                    marginLeft: "-7px",
                                    marginRight: "-4px",
                                }}
                                color="info"
                            />
                        ) : null}
                    </RichOuputViewHeaderButton>
                ))}
            </StyledTableViewHeader>
        </Fragment>
    );
};

export default RichOuputPanelHeader;
