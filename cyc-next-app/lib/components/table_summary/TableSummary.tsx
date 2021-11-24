import { Box, Popover, TableContainer } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback, Fragment } from "react";
import shortid from "shortid";

// redux
import { useSelector, useDispatch } from 'react-redux'
import store from '../../../redux/store';
import { ifElse } from "../libs";
import { IDFMetadata } from "../AppInterfaces";
import ColumnSummary from "./ColumnSummary";


const TableSummary = (props: any) => {          
    return (
        <TableContainer>
            {console.log("Render TableSummary ")}
            <ColumnSummary />
        </TableContainer>
    );
}

export default TableSummary;


