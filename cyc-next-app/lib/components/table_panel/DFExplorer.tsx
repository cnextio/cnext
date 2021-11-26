import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, Typography } from "@mui/material";
import React, { Fragment, useEffect } from "react";

// redux
import { useDispatch, useSelector } from 'react-redux'
import { setActiveDF } from "../../../redux/reducers/DataFramesRedux";
import store from "../../../redux/store";
import { DFSelector, DFSelectorForm, DFSelectorIcon, DFSelectorInput, DFSelectorMenuItem } from "../StyledComponents";
// import { CountNAContainer } from "./StyledComponents";

const DFExplorer = () => {
    const dfList = useSelector((state) => _checkDFList(state));
    const dispatch = useDispatch();
    
    function _checkDFList(state) {
        let activeDF = state.dataFrames.activeDataFrame;
        return activeDF ? {activeDF: activeDF, list: Object.keys(state.dataFrames.tableData)} : null;        
    };

    // useEffect(() => {
    //     const state = store.getState();
        
    // }, []);

    function handleChange({ target }){
        // console.log('Handle change: ', target);
        dispatch(setActiveDF(target.value));
    };

    return (
        <DFSelectorForm>
            {/* <InputLabel sx={{fontSize: '13px', p: '0px'}}>Data Frame</InputLabel> */}
            {console.log(dfList)}
            <DFSelector                
                onChange={handleChange}
                value={dfList ? dfList.activeDF : ''}
                // label={dfList.activeDF}
                IconComponent={DFSelectorIcon}
                SelectDisplayProps={{style: {padding: '0px 10px', lineHeight: '35px'}}}
                // displayEmpty = {true}
                renderValue = {()=>{
                    return (
                        <Fragment>
                            {dfList ? 
                            <Typography height='100%' variant='caption' fontSize='14px'>
                                {dfList.activeDF}
                            </Typography> :
                            <Typography height='100%' variant='caption' fontSize='12px' color='#BFC7CF'>
                                Data Frame
                            </Typography>
                            }
                        </Fragment>
                    )    
                }}                
            >
            {dfList && dfList.list.map((item, index)=>(
            <DFSelectorMenuItem value={item}>{item}</DFSelectorMenuItem>
            ))}                
            </DFSelector>
        </DFSelectorForm>
    )
}

export default DFExplorer;