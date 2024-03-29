import {
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Menu,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Table,
    TableCell,
    TableContainer as MuiTableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    BottomNavigation,
} from "@mui/material";
// import { TabsUnstyled } from '@mui/base';
// import InputUnstyled, { InputUnstyledProps } from '@mui/core/InputUnstyled'
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BoltIcon from "@mui/icons-material/Bolt";
import CloseIcon from "@mui/icons-material/Close";
import SplitPane from "react-split-pane-v2";
import styled, { keyframes } from "styled-components";
// import { CSSTransition } from 'react-transition-group';
import { ToastContainer } from "react-toastify";
import CodeMirror from "@uiw/react-codemirror";
import { TreeView, TreeItem } from "@mui/lab";

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
            props.selected ? "rgba(25, 118, 210, 1)" : props.theme.palette.background.paper};
    background-color: ${(props) =>
        props.selected ? "rgba(25, 118, 210, 0.1)" : "props.theme.palette.background.paper"};
    &:hover {
        cursor: pointer;
        background-color: ${(props) =>
            props.selected ? "rgba(25, 118, 210, 0.1)" : props.theme.palette.grey.A200};
        border-left: 4px solid ${(props) => (props.selected ? "rgba(25, 118, 210, 1)" : "black")};
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
export const ProjectExplorerToolbar = styled.div`
    display: flex;
    align-items: center;
    .icon {
        color: rgba(0, 0, 0, 0.6);
        font-size: 22px;
        cursor: pointer;
    }
`;
export const FileTree = styled(TreeView)`
    max-width: 100%;
    // height: 100%;
`;

export const FileItem = styled(TreeItem)`
    .MuiTreeItem-label {
        font-size: 13px;
        line-height: 2em;
    }
    .MuiTreeItem-group {
        border-left: 1px solid ${(props) => props.theme.palette.grey.A400};
    }
    .MuiTreeItem-content {
        padding-left: 7px;
    }
    .MuiTreeItem-iconContainer {
    }
    color: ${(props) => props.theme.palette.text.secondary};
    width: 100%;
`;

export const OpenProjectItem = styled(TreeItem)`
    .MuiTreeItem-label {
        font-size: 13px;
        line-height: 2em;
    }
    .MuiTreeItem-group {
        margin-left: 15px;
        border-left: 1px dotted ${(props) => props.theme.palette.grey.A700};
    }
    color: ${(props) => props.theme.palette.text.secondary};
    width: 100%;
`;

export const FileItemLabel = styled.div`
    font-size: 13px;
    line-height: 2em;
    margin-left: -5px;
`;

export const Overlay = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
    top: 0;
    left: 0;
    background-color: rgb(238, 238, 238, 0.1);
`;

export const OpenProjectTree = styled(FileTree)``;

export const ClosedProjectItem = styled.div`
    display: flex;
    flex-direction: row;
    padding-left: 8px;
    font-style: italic;
    cursor: pointer;
    color: ${(props) => props.theme.palette.text.secondary};
`;

export const ContextMenu = styled(Menu)`
    .MuiMenu-paper {
        background-color: ${(props) => props.theme.palette.grey.A100};
    }
`;

export const ContextMenuItem = styled(MenuItem)`
    font-size: 14px;
`;

export const ProjectExplorerNewItem = styled(TextField)`
    margin-left: -5px;
    .MuiInputBase-input {
        font-size: 12px;
        padding: 5px;
        width: 100%;
    }
`;

export const WorkingPanelSplitPanel = styled(SplitPane)`
    padding-left: inherit;
    padding-right: inherit;
    height: 100%;
`;
// export const StyleXTerm = styled(XTerm)`
//     height: 100%;
// `;
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
    width: calc(100% - 115px);
    height: calc(var(--var-height));
    min-height: calc(var(--var-height));
    align-items: center;
    background-color: ${(props) => props.theme.palette.grey.A200};
    overflow: auto;

    ::-webkit-scrollbar {
        height: 0px;
    }
`;

export const ProjectExplorerContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
`;

export const ProjectToolbar = styled.div`
    justify-content: space-between;
    display: flex;
    --var-height: 30px;
    height: calc(var(--var-height));
    align-items: center;
    background-color: ${(props) => props.theme.palette.grey.A200};
    overflow: auto;

    ::-webkit-scrollbar {
        height: 0px;
        width: 100%;
    }

    svg:last-child {
        margin-right: 10px;
        margin-left: auto;
    }
`;

export const ProjectList = styled.div`
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;
`;

export const FileCloseIconContainer = styled.div`
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

    animation: ${(props) =>
            props.executing
                ? textTransitionToColor("#F59242", props.theme.palette.grey.A200)
                : null}
        2s ease infinite;

    color: ${(props) =>
        props.saved ? props.theme.palette.text.secondary : props.theme.palette.error.dark};

    background-color: ${(props) =>
        props.selected ? props.theme.palette.background.paper : props.theme.palette.grey.A200};
    border-width: 1px;
    &:hover {
        cursor: pointer;
        background-color: ${(props) =>
            props.selected ? props.theme.palette.background.paper : props.theme.palette.grey.A100};
    }
`;

export const FileNameTabContainer = styled.div`
    position: relative;
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
    padding: 0px 5px 0px 0px;
    align-self: stretch;
    height: 100%;
    width: 100%;
    //scrollable (https://stackoverflow.com/questions/43788878/scrollable-list-component-from-material-ui-in-react)
    overflow: auto;
    max-width: 100%;
    font-size: 13px;
    // max-height: 100%;

    .cm-gutters {
        border-right: 0px;
    }
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
        background-color: white; //rgb(218, 255, 237, 0.3);
    }

    .cm-groupedline.active {
        background-color: rgb(218, 255, 237, 0.6);
    }

    .cm-groupedfirstlinegutter {
        // margin-top: 19.2px;
    }

    .cm-groupedlastlinegutter {
        // margin-bottom: 19.1903px;
    }

    .cm-groupedfirstline {
        // margin-top: 18.2px;
        // padding-top: 18.2px;
        border-top: 1px dashed rgb(153, 179, 171, 0.5);
        background-color: white; //rgb(218, 255, 237, 0.3);
    }

    .cm-groupedfirstline.active {
        // margin-top: 10px;
        border-top: 1px solid rgb(153, 179, 171, 0.6);
        background-color: rgb(218, 255, 237, 0.6);
    }

    .cm-groupedlastline {
        // padding-bottom: 18.2px;
        border-bottom: 1px dashed rgb(153, 179, 171, 0.5);
        background-color: white; //rgb(218, 255, 237, 0.3);
    }

    .cm-groupedlastline.active {
        // margin-bottom: 10px;
        border-bottom: 1px solid rgb(153, 179, 171, 0.6);
        background-color: rgb(218, 255, 237, 0.6);
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

    .cm-groupwidget {
        height: 18px;
        width: 100%;
        /* padding-left: 5px; */
        &.show {
            cursor: pointer;
            font-size: 11px;
            /* opacity: 0.9; */
            opacity: 0;
            color: rgba(0, 0, 0, 0.6);
            &:hover {
                opacity: 1;
            }
            /* padding-top: 4px; */
        }
        .cm-cellcommand {
            display: inline-block;
            margin-left: 5px;
            position: relative;
            &:not(:last-child) {
                /* border-right: 1px solid #42a5f5; */
            }
            .icon-cellcommand {
                webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                width: 1em;
                height: 1em;
                display: inline-block;
                fill: currentColor;
                -webkit-flex-shrink: 0;
                -ms-flex-negative: 0;
                flex-shrink: 0;
                -webkit-transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                font-size: 1rem;
            }
            .tooltiptext {
                visibility: hidden;
                font-size: 11px;
                background-color: #727171;
                color: #fff;
                text-align: center;
                border-radius: 6px;
                padding: 2px 4px;
                min-width: 35px;
                position: absolute;
                z-index: 1;
                bottom: -80%;
                left: 120%;
                margin-left: -5px;
                opacity: 1;
                transition: opacity 0.3s;
                &::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    /* border-color: #555 transparent transparent transparent; */
                }
            }
            &:hover {
                .tooltiptext {
                    visibility: visible;
                }
                /* color: #8a8989; */
                svg {
                    background-color: #f3f3f3;
                }
            }
        }
    }

    .cm-foldGutter {
        font-size: 11px;
    }

    .stop-scrolling {
        height: 100%;
        overflow: hidden;
    }
`;
export const ExecutorToolbar = styled.span`
    background: #f6f5f5;
    display: flex;
    position: absolute;
    padding-right: 10px;
    right: 0;
    height: 30px;
    .icon {
        padding: 0px 3px 0px 3px;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.6);
        svg {
            margin-top: 5px;
            font-size: 20px;
        }
        &:hover {
            svg {
                background-color: #e6e5e5;
                background-clip: content-box;
            }
        }
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
        animation: ${backgroundTransitionToColor("#fff3f9", "white")} 1s ease 0s;
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
export const TextIOContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0px 10px 0px 10px;
    color: ${(props) => props.theme.palette.text.secondary};
    height: 100%;
    width: 100%;
`;

export const TextIOHeader = styled.div`
    height: 25px;
    display: flex;
    flex-direction: row;
    .executor-status {
        margin-left: auto;
        align-self: center;
    }
`;

export const TextIOHeaderText = styled(Typography)`
    // height: 30px;
    // text-decoration: underline;
    font-size: 11px;
    border-bottom-style: ${(props) => (props.underline ? `solid` : `none`)};
    margin-right: 10px;
    border-width: 1px;
    cursor: pointer;
`;
// need this compoent to make the text output respect tab character
export const TextIOContent = styled.div`
    overflow: auto;
    height: 100%;
    // flex-grow: 1;
`;
// export const IndividualControlPanelContent = styled.pre`
//     margin: 0px;
//     padding: 5px 0px 5px 0px;
//     overflow: auto;
//     max-height: 100%;
//     &:hover {
//         background-color: ${props => props.theme.palette.action.hover};
//     }
// `;
export const IndividualConsolePanelContent = styled(Typography)`
    margin-bottom: 10px;
    padding: 5px 0px 5px 0px;
    overflow: auto;
    font-size: 13px;
    &:hover {
        background-color: ${(props) =>
            !props.focused ? props.theme.palette.action.hover : "rgb(218, 255, 237, 0.6)"};
    }

    background-color: ${(props) => (props.focused ? "rgb(218, 255, 237, 0.6)" : null)};

    border-top: ${(props) =>
        props.focused ? "1px solid rgb(153, 179, 171, 0.6)" : "1px dashed rgb(153, 179, 171, 0.5)"};
    border-bottom: ${(props) =>
        props.focused ? "1px solid rgb(153, 179, 171, 0.6)" : "1px dashed rgb(153, 179, 171, 0.5)"};

    code {
        display: inline-block;
        white-space: pre-wrap; /* Since CSS 2.1 */
        white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
        white-space: -pre-wrap; /* Opera 4-6 */
        white-space: -o-pre-wrap; /* Opera 7 */
        max-width: 100%;
        // word-break: break-all;
        word-wrap: break-word;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.6em;
    }
`;

export const IndividualConsolePanelContentSmall = styled(Typography)`
    padding: 0px 0px 0px 0px;
    overflow: auto;
    font-size: 12px;
    &:hover {
        background-color: ${(props) =>
            !props.focused ? props.theme.palette.action.hover : "rgb(218, 255, 237, 0.6)"};
    }

    background-color: ${(props) => (props.focused ? "rgb(218, 255, 237, 0.6)" : null)};
    code {
        display: inline-block;
        white-space: pre-wrap; /* Since CSS 2.1 */
        white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
        white-space: -pre-wrap; /* Opera 4-6 */
        white-space: -o-pre-wrap; /* Opera 7 */
        max-width: 100%;
        // word-break: break-all;
        word-wrap: break-word;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.6em;
    }
`;

// export const ReviewButton = styled.a`

// `

export const PanelDivider = styled(Divider)`
    // adding display flex here does not work because the divider width becomes 0, no sure why
    align-self: stretch;
    border-color: ${(props) =>
        props.color == "light" ? props.theme.palette.grey.A100 : props.theme.palette.divider};
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
    padding: 5px 5px 0px 10px;
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
    display: flex;
    font-size: 13px;
    padding: 5px 10px;
    width: 200px;
    height: 32px;
    justify-content: space-between;
    span:nth-child(2, 3) {
        margin-left: auto;
    }
`;

export const DFFilterForm = styled(FormControl)`
    display: flex;
    height: 100%;
    width: 100%;
    padding: 0px 10px 0px 5px;
    font-size: 13px;
`;
export const DFFilterInput = styled(OutlinedInput)`
    font-size: 13px;
    padding: 0px;
`;

export const StdInInput = styled(TextField)`
    height: 34px;
    width: 100%;
    .MuiInput-root {
        height: 100%;
    }
    .MuiInputAdornment-root > p {
        font-size: 12px;
    }
    .MuiOutlinedInput-root {
        border-radius: 0px;
    }
    .MuiOutlinedInput-input {
        font-size: 12px;
        // padding: 0px;
        // height: 100%;
        color: ${(props) => props.theme.palette.text.secondary};
    }
`;

export const QuerySample = styled.div`
    margin-top: 5px;
    // margin-right: 5px;
    padding-right: 5px;
    padding-left: 5px;
    align-self: flex-end;
    z-index: 10;
    color: ${(props) => props.theme.palette.text.secondary};
    background: ${(props) => props.theme.palette.grey.A100};
`;

// export const StyledFilterCodeMirror = styled(CodeMirror)`
export const StyledFilterCodeMirror = styled.div`
    border: 1px solid;
    border-color: ${(props) => props.theme.palette.grey.A400};
    border-radius: 4px;
    overflow: hidden
    line-height: 32px;
    font-size: 14px;
    padding: 0px 5px;
    height: 34px;
    width: 100%;

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
        line-height: 32px;
        font-size: 14px;
        // padding-top: 5px;
    }

    .cm-content {
        line-height: 32px;
        font-size: 14px;
        padding: 0px 0px;
    }

    .cm-editor.cm-focused {
        // line-height: 32px;
        // font-size: 14px;
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

    .Mui-focused {
        border-color: white;
    }
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

    .MuiOutlinedInput-notchedOutline {
        border: none;
    }

    &:hover {
        .MuiOutlinedInput-notchedOutline {
            border: none;
        }
    }
`;

export const DFStatsMenuItem = styled(MenuItem)`
    font-size: 13px;
    padding: 0px 5px 0px 0px;
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
    border-bottom-style: ${(props) => (props.selected ? "solid" : "none")};
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
    & .odd-row {
        background-color: ${(props) => props.theme.palette.action.hover};
    }

    & .even-row {
        background-color: none;
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
    font-weight: ${(props) => (props.head ? "bold" : "normal")};
    vertical-align: ${(props) => (props.head ? "bottom" : "center")};
    text-align: ${(props) => (props.head ? "left" : "right")};
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

export const SingleResultContainer = styled(Paper)`
    background-color: ${(props) => props.theme.palette.background.paper};
    margin: 0px;
    margin-bottom: ${(props) => (!props.showMarkdown ? "10px" : "0px")};
    width: 100%;
    height: 100%;
    border-top: ${(props) =>
        !props.showMarkdown
            ? props.focused
                ? "1px solid rgb(153, 179, 171, 0.6)"
                : "1px dashed rgb(153, 179, 171, 0.5)"
            : "0px"};
    border-bottom: ${(props) =>
        !props.showMarkdown
            ? props.focused
                ? "1px solid rgb(153, 179, 171, 0.6)"
                : "1px dashed rgb(153, 179, 171, 0.5)"
            : "0px"};
    border-left: 0px;
    border-right: 0px;
    border-radius: 0;
    background-color: ${(props) => (props.focused ? "rgb(218, 255, 237, 0.6)" : null)};

    overflow: auto;

    svg {
        // width: 1000px;
        // height: 1000px;
        overflow: scroll;
    }

    .markdown {
        margin: 0px 20px 0px 20px;
        font-size: 14px;
        width: 500px;
        height: 100%;
        p {
            line-height: 18px;
        }
    }

    table,
    th,
    td {
        border: 1px solid black;
        border-collapse: collapse;
        padding: 5px 10px;
        font-size: 12px;
    }
`;

export const SmallVizContainer = styled(MuiTableContainer)`
    background-color: ${(props) => props.theme.palette.background.paper};
    padding: 0px;
    overflow: hidden;
    font-weight: normal;
    &:hover {
        cursor: zoom-in;
    }
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
    textalign: "center";
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
        props.selected ? "rgba(25, 118, 210, 0.1)" : "props.theme.palette.background.paper"};
    &:hover {
        cursor: pointer;
        background-color: ${(props) =>
            props.selected ? "rgba(25, 118, 210, 0.1)" : props.theme.palette.grey.A200};
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

export const LeftFooterItem = styled.a`
    height: 100%;
`;

export const RightFooterItem = styled.a`
    height: 100%;
    float: right;
`;

export const FooterItemText = styled.span`
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

export const ErrorText = styled.span`
    color: #ee3c3c;
    font-size: 13px;
    font-style: italic;
    margin-left: 28px;
    display: block;
`;

export function backgroundTransition(color) {
    return keyframes`
      50% {
        background-color: ${color};
      }
    `;
}

export function backgroundTransitionToColor(color1, color2) {
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

export function textTransitionToColor(color1, color2) {
    return keyframes`
      0% {
        color: ${color1};
      }
      50% {
        color: ${color2};
      }
      100% {
        color: ${color1};
      }
    `;
}

import Pane from "react-split-pane-v2";

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
