import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Input,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    OutlinedInput,
    Paper,
    Popover,
    Select,
    Tab,
    Table,
    TableCell,
    TableContainer as MuiTableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    BottomNavigation,
} from '@mui/material';
// import { TabsUnstyled } from '@mui/base';
// import InputUnstyled, { InputUnstyledProps } from '@mui/core/InputUnstyled'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BoltIcon from '@mui/icons-material/Bolt';
import CloseIcon from '@mui/icons-material/Close';
import SplitPane from 'react-split-pane-v2';
import styled, { keyframes } from 'styled-components';
// import { CSSTransition } from 'react-transition-group';
import { ToastContainer } from 'react-toastify';
import CodeMirror from '@uiw/react-codemirror';
import { TreeView, TreeItem } from '@mui/lab';

export const TopPanel = styled.div`
    display: flex;
    height: 47px;
`;

export const Logo = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 9.5px 8.45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 45px;
    width: 45px;
`;

export const LogoIcon = styled.img`
    width: 40.1px;
    height: 38px;
`;

export const AppBar = styled.div`
    background-color: ${(props) => props.theme.palette.primary.main};
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
    color: ${(props) => props.theme.palette.background.paper};
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
    overflow: hidden;
`;

export const Sidebar = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 0px 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 47px;
`;

export const AppToolbar = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 10px 0px 0px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 47px;
    height: 100%;
`;

export const AppToolbarList = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 0px 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // height: 100px;
    width: 47px;
`;

export const AppToolbarItem = styled.div`
    padding: 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 45px;
    width: 100%;
    &:not(:last-of-type) {
        margin-bottom: 0px;
    }
    border-left: 4px solid
        ${(props) =>
            props.selected ? 'rgba(25, 118, 210, 1)' : props.theme.palette.background.paper};
    background-color: ${(props) =>
        props.selected ? 'rgba(25, 118, 210, 0.1)' : 'props.theme.palette.background.paper'};
    &:hover {
        cursor: pointer;
        background-color: ${(props) =>
            props.selected ? 'rgba(25, 118, 210, 0.1)' : props.theme.palette.grey.A200};
        border-left: 4px solid ${(props) => (props.selected ? 'rgba(25, 118, 210, 1)' : 'black')};
    }
`;

export const MainContainerDivider = styled(Divider)`
    display: flex;
    align-items: center;
`;

export const SideBarDividerContainer = styled.div`
    padding: 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

export const SidebarButton = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 24px;
`;
export const SidebarIcon = styled.div`
    color: ${(props) => props.theme.palette.action};
    width: 75%;
    height: 75%;
`;

// export const SideBarDividerContainer = styled(Divider)`
//     display: flex;
//     align-items: center;
// `;

// export const StyledDividerVertical = styled(
//   DividerVertical
// )``;

export const WorkingPanel = styled.div`
    // display: flex;
    padding: 0px;
    flex-grow: 1;
    position: relative;
    height: 100%;
    overflow: hidden;
`;

export const FileExplorerHeaderName = styled(Typography)`
    display: flex;
    align-items: center;
    height: calc(var(--var-height));
    line-height: calc(var(--var-height));
    padding: 0px 10px 0px 10px;
    font-size: 11px;
    color: ${(props) => props.theme.palette.text.secondary};
    background-color: ${(props) => props.theme.palette.grey.A200};
    border-width: 1px;
    // &:hover {
    //     cursor: pointer;
    //     background-color: ${(props) =>
        props.selected ? props.theme.palette.background.paper : props.theme.palette.grey.A100};
    // }
`;

export const FileTree = styled(TreeView)`
    max-width: 100%;
    height: 100%;
`;

export const FileItem = styled(TreeItem)`
    .MuiTreeItem-label {
        font-size: 13px;
        line-height: 2em;
    }
    .MuiTreeItem-group {
        margin-left: 10px;
    }
    .MuiTreeItem-content {
        // margin-left: 5px;
    }
    color: ${(props) => props.theme.palette.text.secondary};
    width: 100%;
`;

export const ContextMenu = styled(Menu)`
    .MuiMenu-paper {
        background-color: ${(props) => props.theme.palette.grey.A100};
    }
`;

export const ContextMenuItem = styled(MenuItem)`
    font-size: 14px;
`;

export const ContextMenuNewItem = styled(TextField)`
    .MuiInputBase-input {
        font-size: 14px;
        padding: 5px;
        width: 100%;
    }
`;

export const WorkingPanelSplitPanel = styled(SplitPane)`
    padding-left: inherit;
    padding-right: inherit;
    height: 100%;
`;

export const StyledCodePanel = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${(props) => props.theme.palette.background.paper};
    // align-items: center;
    height: 100%;
    overflow: hidden;
    // overflow: auto;
`;

export const CodeToolbar = styled.div`
    display: flex;
    --var-height: 30px;
    height: calc(var(--var-height));
    align-items: center;
    background-color: ${(props) => props.theme.palette.grey.A200};
    overflow: auto;
`;

export const FileNameTabContainer = styled.div`
    display: flex;
    width: 22.5px;
    height: 22.5px;
`;
export const FileNameTab = styled(Typography)`
    display: flex;
    align-items: center;
    height: calc(var(--var-height));
    line-height: calc(var(--var-height));
    padding: 0px 5px 0px 10px;
    font-size: 13px;
    color: ${(props) =>
        props.fileSaved ? props.theme.palette.text.secondary : props.theme.palette.error.dark};
    background-color: ${(props) =>
        props.selected ? props.theme.palette.background.paper : props.theme.palette.grey.A200};
    border-width: 1px;
    &:hover {
        cursor: pointer;
        background-color: ${(props) =>
            props.selected ? props.theme.palette.background.paper : props.theme.palette.grey.A100};
    }
`;

export const ExecutorIcon = styled(BoltIcon)`
    display: inline-block;
    margin: 0 auto;
`;

export const FileCloseIcon = styled(CloseIcon)`
    display: inline-block;
    margin: 0px 0px 0px 2px;
    padding: 4px 0px 2px 0px;
    color: ${(props) => props.theme.palette.text.secondary};

    &:hover {
        cursor: pointer;
        background-color: ${(props) =>
            props.selected ? props.theme.palette.background.paper : props.theme.palette.grey.A200};
    }
`;

export const CodeContainer = styled.div`
    // display: flex;
    padding: 0px;
    flex-grow: 1;
    position: relative; //must have for the spliter to work
    height: 100%; //TODO: can't make this 100% because the scroll to the top will mess the frame up
    overflow: auto;
`;

export const StyledCodeEditor = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 0px 0px 0px 0px;
    align-self: stretch;
    height: 100%;
    width: 100%;
    //scrollable (https://stackoverflow.com/questions/43788878/scrollable-list-component-from-material-ui-in-react)
    overflow: auto;
    max-width: 100%;
    font-size: 13px;
    // max-height: 100%;
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
        outline: none;
    }

    .cm-genline-flash {
        background-color: #fff3f9;
        animation: ${backgroundTransitionToColor("#fff3f9", "white")} 1s ease 0s;
    }

    .cm-genline-solid {
        background-color: rgb(255, 218, 236, 0.5);
    }

    .cm-groupedline {
        background-color: rgb(218, 255, 237, 0.5);
    }

    .cm-groupedfirstline {
        border-top: 1px dotted rgb(153, 179, 171, 0.5);
        background-color: rgb(218, 255, 237, 0.5);
    }

    .cm-nongroupedfirstline {
        border-top: 1px dotted rgb(153, 179, 171, 0.5);
        background-color: white;
    }

    .cm-cassist-selection {
        border-color: ${(props) => props.theme.palette.grey.A400};
        border-radius: 4px;
        border-width: 0px;
        height: 20px;
        padding: 0px 3px 0 3px;
        &:focus {
            outline: 0px solid ${(props) => props.theme.palette.grey.A400};
        }
    }

    .cm-foldGutter {
        font-size: 11px;
        // padding-right: 2px;
        // padding-top: 3px;
    }
`;

export const StyledCodeMirror = styled(CodeMirror)`
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
        outline: none;
    }

    .cm-gencode-flash {
        background-color: #fff3f9;
        animation: ${backgroundTransitionToColor('#fff3f9', 'white')} 1s ease 0s;
    }

    .cm-gencode-solid {
        background-color: #fff3f9;
    }
`;
export const CodeEditMarker = styled.div`
    height: 10px;
    width: 10px;
    background-color: green;
    border: 2px;
`;
export const CodeOutputContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0px 10px 0px 10px;
    color: ${(props) => props.theme.palette.text.secondary};
    height: 100%;
    width: 100%;
`;

export const CodeOutputHeader = styled.div`
    height: 30px;
`;

export const CodeOutputHeaderText = styled(Typography)`
    // height: 30px;
    // text-decoration: underline;
    font-size: 11px;
    border-bottom-style: solid;
    border-width: 1px;
`;
// need this compoent to make the text output respect tab character
export const CodeOutputContent = styled.div`
    overflow: auto;
    height: 100%;
    flex-grow: 1;
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
    font-size: 13px;
    &:hover {
        background-color: ${(props) => props.theme.palette.action.hover};
    }
    code {
        display: inline-block;
        white-space: pre-wrap; /* Since CSS 2.1 */
        white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
        white-space: -pre-wrap; /* Opera 4-6 */
        white-space: -o-pre-wrap; /* Opera 7 */
        max-width: 100%;
        // word-break: break-all;
        word-wrap: break-word;
    }
`;

// export const ReviewButton = styled.a`

// `

export const PanelDivider = styled(Divider)`
    // adding display flex here does not work because the divider width becomes 0, no sure why
    align-self: stretch;
    border-color: ${(props) =>
        props.color == 'light' ? props.theme.palette.grey.A100 : props.theme.palette.divider};
`;

export const StyledRichOutputPanel = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    // border-radius: 4px;
    // padding: 0px 10px 0px 10px;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    align-items: center;
    height: 100%;
    overflow: hidden;
`;

export const DataToolbar = styled.div`
    display: flex;
    height: 45px;
    padding: 5px 10px 0px 20px;
    align-self: stretch;
`;

export const DFSelectorForm = styled(FormControl)`
    height: 100%;
    width: 120px;
    font-size: 13px;
`;

export const DFSelector = styled(Select)`
    font-size: 13px;
`;

export const SmallArrowIcon = styled(ArrowDropDownIcon)`
    font-size: 20px;
`;

export const DFViewModeSmallArrowIcon = styled(SmallArrowIcon)`
    right: 0;
`;

export const DFSelectorMenuItem = styled(MenuItem)`
    font-size: 13px;
    padding: 5px 10px;
`;

export const DFFilterForm = styled(FormControl)`
    height: 100%;
    width: 100%;
    padding: 0px 10px 0px 5px;
    font-size: 13px;
`;
export const DFFilterInput = styled(OutlinedInput)`
    font-size: 13px;
    padding: 0px;
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
        padding: 5px;
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
`;

export const DFStats = styled.div`
    padding-left: 0px;
    margin-top: 4px;
`;

export const DFStatsForm = styled(FormControl)`
    height: 100%;
    width: 88px;
    font-size: 13px;
    // border-radius: 10px;
    // border-color: red;
`;

export const DFStatsParentCheckbox = styled(Checkbox)`
    .MuiSvgIcon-root {
        font-size: 18px;
    }
`;
export const DFStatsSelector = styled(Select)`
    font-size: 13px;
    .MuiTypography-root {
        font-size: 13px;
    }
    .MuiCheckbox-root {
        padding: 5px 5px 5px 0px;
    }
`;

export const DFStatsMenuItem = styled(MenuItem)`
    font-size: 13px;
    padding: 5px 10px 5px 0px;
    .MuiSvgIcon-root {
        font-size: 18px;
    }
`;

export const DFViewModeMenuItem = styled(MenuItem)`
    font-size: 13px;
    .MuiSvgIcon-root {
        font-size: 18px;
        right: 0;
    }
`;

export const StyledTableViewHeader = styled.div`
    display: flex;
    flex-direction: row;
    padding: 5px 10px 0px 10px;
    height: 30px;
    width: 100%;
    color: ${(props) => props.theme.palette.text.secondary};
`;

export const RichOuputViewHeaderButton = styled(Typography)`
    margin: 0px 10px 0px 0px;
    font-size: 11px;
    border-bottom-style: ${(props) => (props.selected ? 'solid' : 'none')};
    border-width: 1px;
    &:hover {
        cursor: pointer;
    }
`;

export const TableShape = styled(Typography)`
    font-size: 14px;
    color: ${(props) => props.theme.palette.text.secondary};
    padding-top: 5px;
    margin-left: auto;
`;

export const StyledTableView = styled(MuiTableContainer)`
    background-color: ${(props) => props.theme.palette.background.paper};
    // margin-top: 10px;
    padding: 0px 10px 10px 10px; // remove top padding to make the sticky head work, see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
    max-height: 90%; //TODO: can't make this 100% because the scroll to the top will mess the frame up
    overflow: auto;
`;

export const DataTable = styled(Table)`
    border: 1px solid ${(props) => props.theme.palette.divider};
    margin-top: 0px; //see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
`;

export const DataTableHead = styled(TableHead)`
    background-color: ${(props) => props.theme.palette.grey.A400} !important;
`;

export const DataTableHeadRow = styled(TableRow)``;

export const DataTableRow = styled(TableRow)`
    &:nth-of-type(odd) {
        background-color: ${(props) => props.theme.palette.action.hover};
    }
`;

export const DataTableHeadCell = styled(TableCell)`
    font-weight: bold;
    font-size: 13px;
    vertical-align: bottom;
    ${(props) =>
        props.review ? backgroundTransition(props.theme.palette.primary.light) : null} 1s linear 0s;
`;

export const DataTableHeadText = styled.div`
    text-overflow: ellipsis;
`;

export const DataTableIndexCell = styled(TableCell)`
    font-weight: bold;
    font-size: 13px;
    animation: ${(props) =>
            props.review ? backgroundTransition(props.theme.palette.primary.light) : null}
        1s linear 0s;
`;
export const DataTableCell = styled(TableCell)`
    font-weight: ${(props) => (props.head ? 'bold' : 'normal')};
    vertical-align: ${(props) => (props.head ? 'bottom' : 'center')};
    text-align: ${(props) => (props.head ? 'left' : 'right')};
    font-size: 13px;
    animation: ${(props) =>
            props.review ? backgroundTransition(props.theme.palette.primary.light) : null}
        1s linear 0s;
`;

export const ResultViewContainer = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    margin-top: 10px;
    padding: 0px 10px 10px 10px; // remove top padding to make the sticky head work, see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
    // max-height: 100%; //TODO: can't make this 100% because the scroll to the top will mess the frame up
    overflow: auto;
    width: 100%;
    height: 100%;
    .react-grid-layout {
        position: relative !important;
    }
    .react-grid-item {
        // position: relative !important;
    }
    .react-grid-item > .react-resizable-handle {
        // position: relative !important;
    }
    .react-grid-item.react-grid-placeholder {
        // position: relative !important;
    }
`;

export const PlotContainer = styled(Paper)`
    background-color: ${(props) => props.theme.palette.background.paper};
    margin: 1px;
    overflow: auto;
    width: fit-content;
    border-color: ${(props) => (props.focused ? props.theme.palette.primary.light : null)};
    border-width: ${(props) => (props.focused ? '2px' : null)};
    margin-bottom: 8px;
    svg {
        width: 1000px;
        height: 1000px;
        overflow: scroll;
    }
`;

export const SmallVizContainer = styled(MuiTableContainer)`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 0px;
    overflow: hidden;
    font-weight: normal;
`;

export const ExperimentContainer = styled.div`
    display: flex;
    height: 100%;
    padding: 5px;
    align-self: stretch;
`;
export const ExperimentLeftPanel = styled.div`
    padding-left: 20px;
    padding-top: 20px;
    height: 100%;
    width: 200px;
    font-size: 13px;
`;
export const ExpSelectorForm = styled(FormControl)`
    width: 100%;
    font-size: 13px;
    margin-bottom: 10px;
`;
export const RunSelectorForm = styled(FormControl)`
    padding: 5px 0px 5px 0px;
    width: 100%;
    font-size: 13px;
    border: 1px solid ${(props) => props.theme.palette.grey.A400};
    border-radius: 4px;
    overflow: auto;
    height: 92%;
`;
export const RunSelectorLabel = styled(FormControlLabel)`
    margin: 0px;
    width: 100%;
    white-space: nowrap;
    .MuiFormControlLabel-label {
        font-size: 13px;
    }
    .MuiCheckbox-root {
        padding: 5px 5px 5px 5px;
    }
    .MuiSvgIcon-root {
        font-size: 18px;
    }
`;
export const RunTimeLabel = styled(Typography)`
    color: ${(props) => props.theme.palette.text.secondary};
    font-size: 12px;
`;

export const ExperimentRightPanel = styled.div`
    padding-left: 20px;
    padding-top: 20px;
    height: 100%;
    width: 100%;
    font-size: 13px;
`;

export const MetricPlots = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 0px 10px 10px 10px; // remove top padding to make the sticky head work, see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
    overflow: auto;
    width: 100%;
    height: 100%;
    .react-grid-layout {
        position: relative !important;
    }
`;

export const CountNAContainer = styled.div`
    background-color: ${(props) =>
        props.nonZeroNA ? props.theme.palette.error.light : props.theme.palette.action.hover};
    color: ${(props) =>
        props.nonZeroNA
            ? props.theme.palette.error.contrastText
            : props.theme.palette.text.secondary};
    padding: 0px 4px 0px 4px;
    font-weight: normal;
    font-size: 12px;
    width: 70px;
`;

export const StyledGridView = styled.div`
    background-color: ${(props) => props.theme.palette.background.paper};
    margin-top: 5px;
    padding: 0px 10px 10px 10px; // remove top padding to make the sticky head work, see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
    // max-height: 90%; //TODO: can't make this 100% because the scroll to the top will mess the frame up
    overflow: auto;
`;

export const DataGridItem = styled(Paper)`
    padding: 10px;
    textalign: 'center';
    color: ${(props) => props.theme.palette.text.secondary};
`;

export const DataGridItemMetadata = styled.div`
    // padding: 0px;
    // line-height: "100%";
`;

export const DataPanelToolbarBtn = styled.div`
    margin-left: auto;
    padding: 2px;
    display: flex;
    align-items: center;
    background-color: ${(props) =>
        props.selected ? 'rgba(25, 118, 210, 0.1)' : 'props.theme.palette.background.paper'};
    &:hover {
        cursor: pointer;
        background-color: ${(props) =>
            props.selected ? 'rgba(25, 118, 210, 0.1)' : props.theme.palette.grey.A200};
    }
`;

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
`;

export const ImageMimeCell = styled.img`
    max-width: 150px;
    max-height: 150px;
`;

export const FooterNavigation = styled.div`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    border-top: solid 1px #bfbfbf;
    z-index: 1;
    background-color: #bfbfbf;
    height: 22px;
`;

export const FooterItem = styled.a`
    height: 100%;
`;

export const FotterItemText = styled.span`
    font-size: 11px;
    color: white;
    cursor: pointer;
    display: inline-flex;
    float: left;
    margin: 0 12px 8px 8px;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Old versions of Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
`;

export const FooterBar = styled(BottomNavigation)`
    width: 40px;
    height: 40px;
`;

function backgroundTransition(color) {
    return keyframes`
      50% {
        background-color: ${color};
      }
    `;
}

function backgroundTransitionToColor(color1, color2) {
    return keyframes`
      0% {
        background-color: ${color1};
      }
      50% {
        background-color: ${color2};
      }
      100% {
        background-color: ${color1};
      }
    `;
}

import Pane from 'react-split-pane-v2';

export const FilePane = styled(Pane)`
    animation: ${slidein()} 1s easein 0s;
    // animation-duration: 3s;
    // animation-name: ${slidein()};
`;

function slidein() {
    return keyframes`{
        from {
          margin-left: 100%;
          width: 300%;
        }

        to {
          margin-left: 0%;
          width: 100%;
        }
    }`;
}
