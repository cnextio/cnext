import { Table, TableCell, TableContainer as MuiTableContainer, TableHead } from '@mui/material';
import SplitPane, { Pane } from 'react-split-pane';
import styled from 'styled-components';

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
    height: 47px;
    width: 47px
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
    height: 40px;
    padding: 10px;
    align-self: stretch;
`;

export const CodeArea = styled.div`
    // display: flex;
    padding: 0px; 
    flex-grow: 1;   
    position: relative; //must have for the spliter to work
    height: 88%;    //TODO: can't make this 100% because the scroll to the top will mess the frame up
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

export const CodeOutputArea = styled.div`
    // display: flex;
    padding: 10px; 
    // flex-grow: 1;   
    height: 100%; 
    max-width: 100%;
    max-height: 100%;
`;

// need this compoent to make the text output respect tab character
export const TextCodeOutputArea = styled.pre`
    overflow: auto;
    max-height: 100%;   
    // margin: 0px; 
`;

export const WorkingPanelDivider = styled.div`
    // adding display flex here does not work because the divider width becomes 0, no sure why        
    align-self: stretch;    
`;

export const TablePanel = styled.div`
    background-color: ${props => props.theme.palette.background.paper};
    overflow: hidden;
    // border-radius: 4px;
    display: flex;
    flex-grow: 1;   
    flex-direction: column;
    align-items: center;
    // border: 1px solid ${props => props.theme.palette.divider};
    //width: 70%;     
    height: 100%;
`;

export const WorkingPanelSplitPanel = styled(SplitPane)`
    padding-left: inherit;
    padding-right: inherit;
    height: 100% - 12px;
`;

export const TableToolbar = styled.div`
    display: flex;
    height: 40px;
    padding: 10px;
    align-self: stretch;
`;

export const TableContainer = styled(MuiTableContainer)`
    background-color: ${props => props.theme.palette.background.paper};
    padding: 10px;
    display: flex;
    align-self: stretch;      
    max-width: 100%;
    overflow: auto;            
`;

export const DataTable = styled(Table)`
    border: 1px solid ${props => props.theme.palette.divider};
`

export const DataTableHead = styled(TableHead)`
    background-color: ${props => props.theme.palette.grey.A200};
`

export const DataTableHeadCell = styled(TableCell)`
    font-weight: medium;
    font-size: 16px;
`

// export const CodeAreaSplitPanel = styled(SplitPane)`
//     padding-left: inherit;
//     padding-right: inherit;
//     height: 300px;
// `;