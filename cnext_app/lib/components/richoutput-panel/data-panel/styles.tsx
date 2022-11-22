import styled from "styled-components";
import {
    Checkbox,
    FormControl,
    MenuItem,
    Select,
    Table,
    TableCell,
    TableContainer as MuiTableContainer,
} from "@mui/material";
import { backgroundTransition } from "../../StyledComponents";

export const TableContainer = styled(MuiTableContainer)`
    background-color: ${(props) => props.theme.palette.background.paper};
    // margin-top: 10px;
    padding: 0px 10px 10px 10px; // remove top padding to make the sticky head work, see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
    max-height: 90%; //TODO: can't make this 100% because the scroll to the top will mess the frame up
    overflow: auto;
`;

export const DataTable = styled(Table)`
    border: 1px solid ${(props) => props.theme.palette.divider};
    margin-top: 0px; //see https://stackoverflow.com/questions/10054870/when-a-child-element-overflows-horizontally-why-is-the-right-padding-of-the-par
    width: fit-content;
    & .resizer {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 5px;
        background: rgba(0, 0, 0, 0.5);
        cursor: col-resize;
        user-select: none;
        touch-action: none;
    }

    & .resizer.isResizing {
        background: blue;
        opacity: 1;
    }

    @media (hover: hover) {
        & .resizer {
            opacity: 0;
        }

        & *:hover > .resizer {
            opacity: 1;
        }
    }
`;

export const DataTableCell = styled(TableCell)`
    vertical-align: center;
    text-align: right;
    font-size: 13px;
    animation: ${(props) =>
            props.review ? backgroundTransition(props.theme.palette.primary.light) : null}
        1s linear 0s;

    &.MuiTableCell-head {
        text-align: left;
        vertical-align: bottom;
        font-weight: bold;
    }

    &.text-cell {
        text-align: left;
        white-space: pre-wrap;
    }
`;

export const ColumnVisible = styled.div`
    padding-left: 0px;
    margin-top: 4px;
`;

export const ColumnVisibleForm = styled(FormControl)`
    height: 100%;
    width: 88px;
    font-size: 13px;

    .Mui-focused {
        border-color: white;
    }
`;

export const ColumnVisibleParentCheckbox = styled(Checkbox)`
    .MuiSvgIcon-root {
        font-size: 18px;
    }
`;

export const ColumnVisibleSelector = styled(Select)`
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

export const ColumnVisibleMenuItem = styled(MenuItem)`
    font-size: 13px;
    padding: 0px 10px 0px 0px;
    .MuiSvgIcon-root {
        font-size: 18px;
    }
`;
