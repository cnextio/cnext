import React from "react";
import { SmallVizContainer } from "../../StyledComponents";

// redux
import { useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import { createPlot } from "../../dataframe-manager/udf/libUDF";
import { UDFLocation, UDFOutputType } from "../../../interfaces/IDataFrameManager";
import Popover from "@mui/material/Popover";
import { SpecialMimeType } from "../../../interfaces/IApp";
import CountNA from "./CountNA";

export const UDFContainer = ({ colName }: { colName: string }) => {
    const registeredUDFs = store.getState().dataFrames.registeredUDFs;
    
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);

    const metadata = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.metadata[activeDataFrame] : null
    );

    const udfConfigs = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.udfsSelector[activeDataFrame] : null
    );

    const showedUDFs = Object.keys(registeredUDFs.udfs).reduce(
        (showedUDFs: any[], key) => {
            // console.log("showedUDFs: ", key, udfsConfig, registeredUDFs[key].config.view_configs);
            if (
                udfConfigs &&
                udfConfigs.udfs[key] &&
                UDFLocation.TABLE_HEAD in registeredUDFs.udfs[key].config.view_configs
            ) {
                showedUDFs.push({ name: key, udf: registeredUDFs.udfs[key] });
            }
            return showedUDFs;
        },[]
    );

    /** for UDFView.TABLE_HEAD UDFs we only support 1 UDF per row so only sort by row */
    showedUDFs.sort(
        (a, b) =>
            a.udf.config.view_configs[UDFLocation.TABLE_HEAD].position.row -
            b.udf.config.view_configs[UDFLocation.TABLE_HEAD].position.row
    );
    // console.log("showedUDFs: ", showedUDFs);
    return (
        <>
            {activeDataFrame &&
                metadata &&
                metadata.columns[colName] &&
                !Object.values(SpecialMimeType).includes(
                    metadata.columns[colName].type as SpecialMimeType
                ) && (
                    <>
                        {showedUDFs.map((data, index) => {
                            let udfConfig = data.udf.config.view_configs[UDFLocation.TABLE_HEAD];
                            return (
                                <IndividualUDFContainer
                                    key={index}
                                    udfName={data.name}
                                    df_id={activeDataFrame}
                                    col_name={colName}
                                    width={udfConfig.shape ? udfConfig.shape.width : 80}
                                    height={udfConfig.shape ? udfConfig.shape.height : 50}
                                />
                            );
                        })}

                        <CountNA df_id={activeDataFrame} col_name={colName} />
                    </>
                )}
        </>
    );
};

export const IndividualUDFContainer = ({
    udfName,
    df_id,
    col_name,
    width,
    height,
}: {
    udfName: string;
    df_id: string;
    col_name: string;
    width: number;
    height: number;
}) => {
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
    const id = open ? "zoom-viz" : undefined;

    const renderUDF = () => {
        let registeredUDFs = store.getState().dataFrames.registeredUDFs;
        if (udfData && registeredUDFs) {
            if (registeredUDFs.udfs[udfName].config.type === UDFOutputType.IMAGE) {
                return (
                    <div>
                        <SmallVizContainer aria-describedby={id} onClick={handlePopoverOpen}>
                            {createPlot(udfData, width, height)}
                        </SmallVizContainer>
                        <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handlePopoverClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
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
};

export default UDFContainer;
