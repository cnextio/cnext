import { TableBody, TableRow, Typography } from "@mui/material";
import React, { useEffect } from "react";

// redux
import { useSelector } from "react-redux";
import { SpecialMimeType } from "../../../interfaces/IApp";
import { DataTable, DataTableCell, StyledTableView } from "../../StyledComponents";
import CountNA from "../data-panel/CountNA";
import store, { RootState } from "../../../../redux/store";
import CypressIds from "../../tests/CypressIds";
import { UDFLocation } from "../../../interfaces/IDataFrameManager";
import { IndividualUDFContainer } from "../data-panel/UDFContainer";

const ColumnSummary = (props: any) => {
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const udfsConfig = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.udfsSelector[activeDataFrame] : null
    );
    const dfMetadata = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.metadata[activeDataFrame] : null
    );
    const columnSelector = useSelector((state: RootState) =>
        activeDataFrame ? state.dataFrames.columnSelector[activeDataFrame].columns : {}
    );
    const renderColumnMetadata = (col_name: string) => {
        return (
            <>
                <DataTableCell
                    style={{
                        "text-align": "left",
                        "white-space": "nowrap",
                    }}
                >
                    <Typography
                        sx={{
                            "font-size": "14px",
                            "font-weight": "bold",
                        }}
                        variant="subtitle2"
                    >
                        {col_name}
                    </Typography>
                </DataTableCell>
                <DataTableCell
                    style={{
                        "text-align": "left",
                        "white-space": "nowrap",
                    }}
                >
                    <Typography sx={{ "font-size": "14px" }} variant="caption">
                        {dfMetadata.columns[col_name].type}
                    </Typography>
                </DataTableCell>
            </>
        );
    };

    const renderQuantilePlot = (col_name: string) => {
        return (
            <>
                <IndividualUDFContainer
                    // key={index}
                    udfName={"quantile"}
                    df_id={activeDataFrame}
                    col_name={col_name}
                    width={250}
                    height={50}
                />
            </>
        );
    };

    const renderColumnSummary = (col_name: string) => {
        if (dfMetadata) {
            return (
                <>
                    <DataTableCell
                        style={{
                            "text-align": "left",
                            "white-space": "nowrap",
                        }}
                    >
                        <CountNA df_id={activeDataFrame} col_name={col_name}></CountNA>
                    </DataTableCell>
                    <DataTableCell
                        style={{
                            "text-align": "left",
                            width: "1%",
                            "white-space": "nowrap",
                        }}
                    >
                        {/* {console.log(dfMetadata.columns[col_name].desribe)} */}
                        <div>
                            {dfMetadata.columns[col_name].describe &&
                                Object.keys(dfMetadata.columns[col_name].describe).map(
                                    (item: String, index: number) => (
                                        <Typography
                                            sx={{
                                                "font-size": "14px",
                                            }}
                                            variant="caption"
                                        >
                                            {dfMetadata.columns[col_name].describe[item] ? (
                                                <>
                                                    <Typography
                                                        sx={{
                                                            "font-size": "14px",
                                                        }}
                                                        variant="caption"
                                                    >
                                                        {item}:{" "}
                                                    </Typography>
                                                    {typeof dfMetadata.columns[col_name].describe[
                                                        item
                                                    ] != "string"
                                                        ? Number.isInteger(
                                                              dfMetadata.columns[col_name].describe[
                                                                  item
                                                              ]
                                                          )
                                                            ? dfMetadata.columns[col_name].describe[
                                                                  item
                                                              ]
                                                            : Number.parseFloat(
                                                                  dfMetadata.columns[col_name]
                                                                      .describe[item]
                                                              ).toFixed(2)
                                                        : dfMetadata.columns[col_name].describe[
                                                              item
                                                          ]}
                                                    &nbsp;&nbsp;
                                                </>
                                            ) : null}
                                            {item === "std" ? <br /> : null}
                                        </Typography>
                                    )
                                )}
                        </div>
                        <div>{renderQuantilePlot(col_name)}</div>
                    </DataTableCell>
                </>
            );
        } else return null;
    };

    const renderUDF = (col_name: string) => {
        const registeredUDFs = store.getState().dataFrames.registeredUDFs;
        const showedUDFs = Object.keys(registeredUDFs.udfs).reduce((showedUDFs: any[], key) => {
            /** we will show "quantile" plot seperately in renderColumnSummary */
            if (
                key !== "quantile" &&
                udfsConfig &&
                udfsConfig.udfs[key] &&
                UDFLocation.SUMMARY in registeredUDFs.udfs[key].config.view_configs
            ) {
                showedUDFs.push({ name: key, udf: registeredUDFs.udfs[key] });
            }
            return showedUDFs;
        }, []);

        /** for UDFView.SUMMARY UDFs we only support 1 UDF per col so only sort by col */
        showedUDFs.sort(
            (a, b) =>
                a.udf.config.view_configs[UDFLocation.SUMMARY].position.col -
                b.udf.config.view_configs[UDFLocation.SUMMARY].position.col
        );

        return (
            <>
                {dfMetadata &&
                    dfMetadata.columns[col_name] &&
                    !Object.values(SpecialMimeType).includes(
                        dfMetadata.columns[col_name].type as SpecialMimeType
                    ) && (
                        <>
                            {showedUDFs.map((data, index) => {
                                let udfConfig = data.udf.config.view_configs[UDFLocation.SUMMARY];
                                return (
                                    <DataTableCell style={{ "text-align": "left" }}>
                                        <IndividualUDFContainer
                                            key={index}
                                            udfName={data.name}
                                            df_id={activeDataFrame}
                                            col_name={col_name}
                                            width={udfConfig.shape ? udfConfig.shape.width : 200}
                                            height={udfConfig.shape ? udfConfig.shape.height : 70}
                                        />
                                    </DataTableCell>
                                );
                            })}
                        </>
                    )}
            </>
        );
    };

    const visibleColumns = React.useMemo<any>(() => {
        let colums = Object.keys(columnSelector).filter((item) => columnSelector[item]);
        if (dfMetadata?.columns) {
            return Object.fromEntries(
                Object.entries(dfMetadata?.columns).filter(([key, value]) => colums.includes(key))
            );
        }
    }, [columnSelector, activeDataFrame, dfMetadata]);
    return (
        <StyledTableView style={{ padding: "10px" }} data-cy={CypressIds.dfSummaryTable}>
            {console.log("Render ColumnSummary ")}
            {dfMetadata ? (
                <DataTable style={{ border: 0 }} size="small">
                    <TableBody style={{ border: 0 }}>
                        {Object.keys(visibleColumns).map((col_name: string, index: number) => (
                            <TableRow key={index}>
                                {/* , 'width': '1%', 'white-space': 'nowrap' */}
                                {renderColumnMetadata(col_name)}
                                {renderColumnSummary(col_name)}
                                {renderUDF(col_name)}
                            </TableRow>
                        ))}
                    </TableBody>
                </DataTable>
            ) : null}
        </StyledTableView>
    );
};

export default ColumnSummary;
