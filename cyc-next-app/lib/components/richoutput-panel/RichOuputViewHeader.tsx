import { Box, Popover } from "@mui/material";
import React, { Fragment } from "react";
import { useSelector } from 'react-redux'
import { StyledTableViewHeader, TableShape, TableViewHeaderButton } from "../StyledComponents";
import { ResultViewHeader } from "../../interfaces/IResultViewer";


const RichOuputViewHeader = ({show, setShow}) => {        
    const activeDataFrame = useSelector((state) => state.dataFrames.activeDataFrame);
    const dfMetadata = useSelector((state) => state.dataFrames.metadata[activeDataFrame]);
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
                {/* {dfMetadata?                      
                <TableShape variant='subtitle'>
                    Shape: {dfMetadata.shape[0]}x{dfMetadata.shape[1]}
                </TableShape>
                : null} */}
            </StyledTableViewHeader>            
        </Fragment>
    );
}

export default RichOuputViewHeader;


