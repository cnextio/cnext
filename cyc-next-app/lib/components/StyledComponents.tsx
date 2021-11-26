import { Box, Button, FormControl, Input, MenuItem, OutlinedInput, Paper, Popover, Select, Table, TableCell, TableContainer as MuiTableContainer, TableHead, TableRow, Typography } from '@mui/material';
// import InputUnstyled, { InputUnstyledProps } from '@mui/core/InputUnstyled'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SplitPane, { Pane } from 'react-split-pane';
import styled, { keyframes } from 'styled-components';
// import { CSSTransition } from 'react-transition-group';
import { ToastContainer } from 'react-toastify';
import CodeMirror from '@uiw/react-codemirror';

export const TopPanel = styled.div`
    display: flex;
    height: 47px;
`;

export const Logo = styled.div`
    background-color: ${props =>
    props.theme.palette.background.paper};
    padding: 9.5px 8.45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 45px;
    width: 45px
`;

export const LogoIcon = styled.img`
    width: 40.1px;
    height: 38px;
`;

export const AppBar = styled.div`
    background-color: ${props => props.theme.palette.primary.main};
    padding: 4.5px 12px;
    display: flex;
    align-items: center;
    width: 100%;
`;
  
export const LeftSide = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
`;

export const AppBarIcon = styled.div`
    color: ${props =>
    props.theme.palette.background.paper};
    padding: 4px;
    width: 35px;
    height: 35px;
`;
// export const StyledSkeleton = styled(Skeleton)`
//   width: 120px;
//   height: 24px;`;
  
// export const StyledUnstyledIconButton = styled(UnstyledIconButton)``;
// export const StyledUnstyledIconButton = styled(UnstyledIconButton)``;

export const MainPanel = styled.div`
    display: flex;
    height: 100%;
`;

export const Sidebar = styled.div`
    background-color: ${props =>
    props.theme.palette.background.paper};
    padding: 10px 0 759px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 47px;
    height: 100%;
`;

export const SidebarList = styled.div`
    background-color: ${props =>
    props.theme.palette.background.paper};
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 181px;
    width: 47px;
`;
export const SidebarListItem = styled.div`
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50x;
    width: 40px;
    &:not(:last-of-type) {
    margin-bottom: 10px;
    }
`;
export const SidebarButton = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
`;
export const SidebarIcon = styled.div`
    color: ${props =>
    props.theme.palette.action};
    width: 75%;
    height: 75%;
`;

export const SideBarDivider = styled.div`
    display: flex;
    align-items: center;
`;

// export const StyledDividerVertical = styled(
//   DividerVertical
// )``;

export const WorkingPanel = styled.div`
    // display: flex;
    padding: 0px; 
    flex-grow: 1;   
    position: relative;
`;

export const WorkingPanelSplitPanel = styled(SplitPane)`
    padding-left: inherit;
    padding-right: inherit;
    height: 100% - 12px;
`;

export const CodePanel = styled.div`
    background-color: ${props => props.theme.palette.background.paper};
    // overflow: hidden;
    // border-radius: 4px;
    // display: flex;
    flex-direction: column;
    align-items: center;
    // border: 1px solid ${props => props.theme.palette.divider};
    // width: 30%;
    height: 100%;    
`;

    export const CodeToolbar = styled.div`
        display: flex;
        height: 45px;
        padding: 10px;
        align-self: stretch;
    `;

    export const CodeContainer = styled.div`
        // display: flex;
        padding: 0px; 
        flex-grow: 1;   
        position: relative; //must have for the spliter to work
        height: 100%;    //TODO: can't make this 100% because the scroll to the top will mess the frame up
    `;

        export const CodeEditor = styled.div`    
            background-color: ${props => props.theme.palette.background.paper};
            padding: 10px 10px 10px 10px;
            align-self: stretch;      
            height: 100%; 
            width: 100%;
            
            //scrollable (https://stackoverflow.com/questions/43788878/scrollable-list-component-from-material-ui-in-react)
            overflow: auto;
            max-width: 100%;
            max-height: 100%;
        `;

        export const StyledCodeMirror = styled(CodeMirror)`
            // &.cm-tooltip.documentation {
            //     display: block;
            //     margin-left: 0;
            //     padding: 3px 6px 3px 8px;
            //     border-left: 5px solid #999;
            //     white-space: pre;
            //     overflow: scroll;
            // }
            
            .cm-tooltip.lint {
              white-space: pre;
            }
            
            .cm-tooltip.cm-completionInfo {
              position: absolute;
              margin: 1px -4px;
              padding: 10px 10px 10px 10px;
              width: max-content;
              max-width: 1000px;
              max-height: 700px;
              white-space: pre;
              overflow: scroll;
            }

            .cm-editor.cm-focused { 
                outline: none
            }
        `
        
        export const CodeOutputContainer = styled.div`
            // display: flex;
            padding: 0px 10px 10px; 
            color: ${props => props.theme.palette.text.secondary};
            // flex-grow: 1;   
            height: 100%; 
            max-width: 100%;
            max-height: 80%; //have to keep this 80% otherwise scroll to view will mess the frame up           
        `;
            export const CodeOutputHeader = styled(Typography)`
                // height: 10px; 
                // text-decoration: underline;
                font-size: 12px;
                border-bottom-style: solid;
                border-width: 1px;
            `;
            // need this compoent to make the text output respect tab character
            export const CodeOutputContent = styled.div`
                overflow: auto;
                max-height: 100%;   
            `;
            // export const IndividualCodeOutputContent = styled.pre`
            //     margin: 0px;
            //     padding: 5px 0px 5px 0px;
            //     overflow: auto;
            //     max-height: 100%;   
            //     &:hover {
            //         background-color: ${props => props.theme.palette.action.hover};
            //     }
            // `;
            export const IndividualCodeOutputContent = styled(Typography)`
                margin: 0px;
                padding: 5px 0px 5px 0px;
                overflow: auto;
                max-height: 100%;   
                font-size: 14px;
                &:hover {
                    background-color: ${props => props.theme.palette.action.hover};
                }
            `;

            // export const ReviewButton = styled.a`
                
            // `

export const WorkingPanelDivider = styled.div`
    // adding display flex here does not work because the divider width becomes 0, no sure why        
    align-self: stretch;    
`;

export const TablePanel = styled.div`
    background-color: ${props => props.theme.palette.background.paper};
    // border-radius: 4px;
    // padding: 0px 10px 0px 10px;
    display: flex;
    flex-grow: 1;   
    flex-direction: column;
    align-items: center;
    height: 100%;                
`;

        export const TableToolbar = styled.div`
            display: flex;
            height: 45px;
            padding: 5px;
            align-self: stretch;
        `;

        export const DFSelectorForm = styled(FormControl)`
            height: 100%;
            width: 120px; 
            font-size: 13px;                        
        `;
            export const DFSelector = styled(Select)` 
                // &:hover {
                //     border: 0px;
                // }           
                font-size: 13px;       
            `;
            
            export const DFSelectorIcon = styled(ArrowDropDownIcon)`
                font-size: 20px;
            ` ;   

            export const DFSelectorMenuItem = styled(MenuItem)`
                font-size: 13px; 
                padding: 5px 10px;
            `;
        
        export const DFFilterForm = styled(FormControl)`
            height: 100%;
            width: 100%; 
            padding: 0px 0px 0px 5px;
            font-size: 13px;             
        `;
            export const DFFilterInput = styled(OutlinedInput)`            
                font-size: 13px;  
                padding: 0px;      
                :hover {
                    border-color: "red"
                }  
            `;
        
            export const StyledFilterCodeMirror = styled(CodeMirror)`       
                // height = "100%"                 
                
                .cm-tooltip.cm-completionInfo {
                position: absolute;
                margin: 1px -4px;
                padding: 10px 10px 10px 10px;
                width: max-content;
                max-width: 1000px;
                max-height: 700px;
                white-space: pre;
                overflow: scroll;
                }

                .cm-line {
                    line-height: 25px;
                    font-size: 14px;
                    padding: 5px
                }

                .cm-content {
                    padding: 0px 10px;
                }

                .cm-editor.cm-focused { 
                    outline: none;                
                }

                .cm-matchingBracket { 
                    background: none;                
                }
            `
        
        export const StyledTableViewHeader = styled.div`
            display: flex;
            flex-direction: row;
            padding: 5px 10px 0px 10px;
            height: 30px;
            width: 100%;
            color: ${props => props.theme.palette.text.secondary};
        `;

            export const TableViewHeaderButton = styled(Typography)`
                margin: 0px 10px 0px 0px;
                font-size: 12px;
                border-bottom-style: ${props => props.selected ? "solid" : "none"};
                border-width: 1px;
                &:hover {
                    cursor: pointer;
                }
            `;

            export const TableShape = styled(Typography)`
                font-size: 14px;
                color: ${props => props.theme.palette.text.secondary};
                padding-top: 5px;
                // justify-self: stretch;
                margin-left: auto;
            `;

        export const TableContainer = styled(MuiTableContainer)`
            background-color: ${props => props.theme.palette.background.paper};
            padding: 0px 10px 10px 10px; // remove top padding to make the sticky head work, see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
            max-height: 90%; //TODO: can't make this 100% because the scroll to the top will mess the frame up
            overflow: auto;
        `;

            export const DataTable = styled(Table)`
                border: 1px solid ${props => props.theme.palette.divider};      
                margin-top: 10px; //see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par                                   
            `;
                
                export const DataTableHead = styled(TableHead)`
                    background-color: ${props => props.theme.palette.grey.A400} !important;
                `;
                
                export const DataTableHeadRow = styled(TableRow)`
                `;

                export const DataTableRow = styled(TableRow)`
                    &:nth-of-type(odd) {
                        background-color: ${props => props.theme.palette.action.hover};
                    };
                `;
                
                export const DataTableHeadCell = styled(TableCell)`
                    font-weight: bold;
                    font-size: 13px;
                    vertical-align: bottom;
                    ${props => (props.review 
                        ? newColTransition(props)
                        : null)} 1s linear 0s;
                `;
                
                export const DataTableHeadText = styled.div`
                    text-overflow: ellipsis;
                `
                
                export const DataTableIndexCell = styled(TableCell)`
                    font-weight: bold;
                    font-size: 13px;
                    animation:  ${props => (props.review 
                        ? newColTransition(props)
                        : null)} 1s linear 0s; 
                `
                export const DataTableCell = styled(TableCell)`
                    font-weight: ${props => (props.head ? 'bold' : 'normal')};
                    vertical-align: ${props => (props.head ? 'bottom' : 'center')};
                    text-align: ${props => (props.head ? 'left' : 'right')};
                    font-size: 13px;
                    animation:  ${props => (props.review 
                        ? newColTransition(props)
                        : null)} 1s linear 0s; 
                `
        
        export const PlotViewContainer = styled.div`
            background-color: ${props => props.theme.palette.background.paper};
            padding: 0px 10px 10px 10px; // remove top padding to make the sticky head work, see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
            max-height: 100%; //TODO: can't make this 100% because the scroll to the top will mess the frame up
            overflow: auto;
            width: 100%;      
            // display: flex;
            // flex-direction: column;
            // align-content: center;    
        `;        

            export const PlotContainer = styled.div`
                background-color: ${props => props.theme.palette.background.paper};
                padding: 10px; 
                overflow: hidden;       
                width: fit-content;            
            `;
        
        export const SmallVizContainer = styled(MuiTableContainer)`
            background-color: ${props => props.theme.palette.background.paper};
            padding: 0px; 
            overflow: hidden;    
            font-weight: normal;           
        `;

export const CountNAContainer = styled.div`
    background-color: ${props => props.nonZeroNA 
                        ? props.theme.palette.error.light
                        : props.theme.palette.action.hover};
    color: ${props => props.nonZeroNA 
            ? props.theme.palette.error.contrastText
            : props.theme.palette.text.secondary};
    padding: 0px 4px 0px 4px;
    font-weight: normal;
    font-size: 12px;
    width: 70px;
`        
// export const CodeAreaSplitPanel = styled(SplitPane)`
//     padding-left: inherit;
//     padding-right: inherit;
//     height: 300px;
// `;

export const StyledDFStatusNotification = styled(ToastContainer)`
    font-size: 13px;
    & .notif-text {
    }
    & .notif-container {
    }
`

function newColTransition(props) {
    return keyframes`
      50% {
        background-color: ${props.theme.palette.primary.light};
      }
    `;
  }
  

