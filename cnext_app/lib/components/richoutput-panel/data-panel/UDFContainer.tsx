import React from "react";
import { SmallVizContainer } from "../../StyledComponents";

// redux
import { useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import { createPlot } from "../../dataframe-manager/udf/libUDF";
import { UDFOutputType } from "../../../interfaces/IDataFrameManager";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
export function UDFContainer({ udfName, df_id, col_name, width, height }) {
    const udfData = useSelector((state: RootState) => getUDFData(state));
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    function getUDFData(state: RootState) {
        let dfMetadata = state.dataFrames.metadata[df_id];

        if (dfMetadata) {
            let colMetadata = dfMetadata.columns[col_name];
            if (colMetadata && "udfs" in colMetadata) {
                return colMetadata.udfs[udfName];
            }
        }
        return null;
    }

    const renderUDF = () => {
        let registeredUDFs = store.getState().dataFrames.registeredUDFs;
        if (udfData && registeredUDFs) {
            if (registeredUDFs.udfs[udfName].config.type === UDFOutputType.IMAGE) {
                return (
                    <div>
                        <SmallVizContainer
                            aria-owns={open ? "zoom-viz" : undefined}
                            aria-haspopup="true"
                            onMouseEnter={handlePopoverOpen}
                            onMouseLeave={handlePopoverClose}
                        >
                            {createPlot(udfData, width, height)}
                        </SmallVizContainer>
                        <Popover
                            id="zoom-viz"
                            sx={{
                                pointerEvents: "none",
                            }}
                            open={open}
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            onClose={handlePopoverClose}
                            disableRestoreFocus
                        >
                            <SmallVizContainer>
                                {createPlot(udfData, width * 4, height * 4)}
                            </SmallVizContainer>
                        </Popover>
                    </div>
                );
            } else {
                // return <SmallVizContainer>{udfData['text/plain']}</SmallVizContainer>;
                return null;
            }
        }
        return null;
    };

    return renderUDF();
}

export default UDFContainer;
