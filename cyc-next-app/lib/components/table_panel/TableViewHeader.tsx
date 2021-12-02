import { Box, Popover } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback, Fragment } from "react";
import shortid from "shortid";

// redux
import { useSelector, useDispatch } from 'react-redux'
import store from '../../../redux/store';
import { CodeOutputHeader, StyledTableViewHeader, StyledTableViewHeaderItem, TableShape, TableSummaryButton, TableSummaryPopover, TableViewHeaderButton } from "../StyledComponents";
import { ifElse } from "../libs";
import { IDFMetadata } from "../../interfaces/IApp";
import { ResultViewHeader } from "../../interfaces/IResultViewer";


const TableViewHeader = ({show, setShow}) => {        
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    const dfMetadata = useSelector((state) => state.dataFrames.metadata[activeDataFrame]);
    const dispatch = useDispatch();  
    const header = useRef();    
    // const [show, setShow] = useState('Tables');

    function onClick(name: string) {
        setShow(name);
    }

    return (
        <Fragment>
            {console.log("Render TableViewHeader ", dfMetadata)}            
            <StyledTableViewHeader>
                {ResultViewHeader.map((name, index) => (                    
                    <TableViewHeaderButton 
                        selected={show==name? true : false} 
                        variant="overline" 
                        component="span" 
                        onClick={() => onClick(name)}
                    >
                        {name} 
                    </TableViewHeaderButton>
                ))}          
                {dfMetadata?                      
                <TableShape variant='subtitle'>
                    Shape: {dfMetadata.shape[0]}x{dfMetadata.shape[1]}
                </TableShape>
                : null}
            </StyledTableViewHeader>            
        </Fragment>
        
    );
}

export default TableViewHeader;


