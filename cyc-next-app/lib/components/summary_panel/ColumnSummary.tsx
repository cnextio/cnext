import dynamic from "next/dynamic";
import { Box, Divider, List, ListItem, ListItemText, TableBody, TableRow, Typography } from "@mui/material";
import React, { Fragment } from "react";
import shortid from "shortid";
// import Plot from "react-plotly.js";

// redux
import { useSelector, useDispatch } from 'react-redux'
import { ifElse } from "../libs";
import { IColumnMetaData, IDFMetadata } from "../AppInterfaces";
import { DataTable, DataTableCell, DataTableRow, TableContainer } from "../StyledComponents";
import CountNAComponent from "../table_panel/CountNA1";
import ColumnHistogram from "../table_panel/ColumnHistogram";


const PlotWithNoSSR = dynamic(
    () => import("react-plotly.js"),
    { ssr: false }
)

const ColumnSummary = (props: any) => {        
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    const dfMetadata = useSelector((state) => state.dataFrames.metadata[activeDataFrame]);

    function setLayout(col_name: string, width: number = 250, height: number = 50) {
        try {
            /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
            let plotData = JSON.parse(JSON.stringify(dfMetadata.columns[col_name].quantile_plot));
            plotData['data'][0]['hovertemplate'] = "%{x}: %{y}";         
            plotData['layout'] = {width: 250, height: height, 
                                            margin: {b: 0, l: 0, r: 0, t: 0},
                                            xaxis: {showticklabels: false}, yaxis: {showticklabels: false},
                                            hoverlabel: {bgcolor: 'rgba(0,0,0,0.04)', 
                                                        bordercolor: 'rgba(0,0,0,0.04)',
                                                        font: {color: 'rgba(0,0,0,0.6)',
                                                        size: 12}}};
            plotData['config'] = {displayModeBar: false};
            return plotData;
        } catch {
            return null;
        }
    }

    return (
        <TableContainer style={{'padding': '10px'}}>
            {console.log("Render ColumnSummary ")}
            {dfMetadata ?                
            <DataTable style={{ 'border': 0}} size="small">
                <TableBody style={{ 'border': 0}}>                
                    {Object.keys(dfMetadata.columns).map((col_name: string, index: number) => (
                    <TableRow key={index}>
                        {/* , 'width': '1%', 'white-space': 'nowrap' */}
                        <DataTableCell style={{'text-align': 'left', 'white-space': 'nowrap'}}>
                            <Typography sx={{'font-size': '14px', 'font-weight': 'bold'}} variant='subtitle2'>{col_name}</Typography>
                        </DataTableCell>
                        <DataTableCell style={{'text-align': 'left', 'white-space': 'nowrap'}}>
                            <Typography sx={{'font-size': '14px'}} variant='caption'>{dfMetadata.columns[col_name].type}</Typography>
                        </DataTableCell>
                        <DataTableCell style={{'text-align': 'left', 'white-space': 'nowrap'}}>
                            <CountNAComponent df_id={activeDataFrame} col_name={col_name}></CountNAComponent>
                        </DataTableCell>  
                        <DataTableCell style={{'text-align': 'left', 'width':'1%', 'white-space': 'nowrap'}}>
                            {/* {console.log(dfMetadata.columns[col_name].desribe)} */}
                            <div>
                            {Object.keys(dfMetadata.columns[col_name].describe).map((item: String, index:number)=>(
                                <Typography sx={{'font-size': '14px'}} variant='caption'>
                                    {dfMetadata.columns[col_name].describe[item]? 
                                    <Fragment>
                                        <Typography sx={{'font-size': '14px'}} variant='caption'>{item}: </Typography>
                                        {(typeof dfMetadata.columns[col_name].describe[item]) != 'string' ? 
                                            ((Number.isInteger(dfMetadata.columns[col_name].describe[item]) ? 
                                            dfMetadata.columns[col_name].describe[item]
                                            : Number.parseFloat(dfMetadata.columns[col_name].describe[item]).toFixed(2)))
                                            : dfMetadata.columns[col_name].describe[item]
                                        }
                                        &nbsp;&nbsp;                                            
                                    </Fragment>    
                                    : null}                                                                                
                                    {item==='std' ? <br/> : null}
                                </Typography>              
                            ))}
                            </div>
                            <div>
                                {dfMetadata.columns[col_name].quantile_plot ? 
                                React.createElement(PlotWithNoSSR, setLayout(col_name)) 
                                : null}                    
                            </div>
                        </DataTableCell>      
                        <DataTableCell style={{'text-align': 'left'}}>
                            {/* TODO: consider unify ColumnHistogram with quantile plot*/}
                            <ColumnHistogram  
                                df_id={activeDataFrame} 
                                col_name={col_name} 
                                width={200}
                                height={70}
                            />
                        </DataTableCell>                    
                    </TableRow>                        
                    ))}
                </TableBody>
            </DataTable>
            : null}
        </TableContainer>        
    );
}

export default ColumnSummary;


