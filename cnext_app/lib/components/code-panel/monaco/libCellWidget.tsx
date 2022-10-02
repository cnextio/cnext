import { setCellCommand } from "../../../../redux/reducers/CodeEditorRedux";
import store from "../../../../redux/store";
import { CellCommand, ICodeLine } from "../../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const createCellWidgetDom = (
    groupID: string,
    afterLineNumber: number,
    endBoundaryWidget: boolean,
    activeClass: string
) => {
    let wrapDiv = document.createElement("div");
    const cellItems = [
        {
            text: "Run Cell",
            cellCommand: CellCommand.RUN_CELL,
            svg: `<svg class="icon-cellcommand MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="PlayArrowIcon"><path d="M8 5v14l11-7z"></path></svg>`,
        },
        {
            text: "Clear Result",
            cellCommand: CellCommand.CLEAR,
            svg: `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall icon-cellcommand" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="PlaylistRemoveIcon"><path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zM3 16h7v-2H3v2zm11.41 6L17 19.41 19.59 22 21 20.59 18.41 18 21 15.41 19.59 14 17 16.59 14.41 14 13 15.41 15.59 18 13 20.59 14.41 22z"></path></svg>`,
        },
        {
            text: "Add Cell",
            cellCommand: CellCommand.ADD_CELL,
            svg: `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall icon-cellcommand" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="AddCardIcon"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h10v-2H4v-6h18V6c0-1.11-.89-2-2-2zm0 4H4V6h16v2zm4 9v2h-3v3h-2v-3h-3v-2h3v-3h2v3h3z"></path></svg>`,
        }, {
            text: "Delete Cell",
            cellCommand: CellCommand.DELL_CELL,
            svg: `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall icon-cellcommand" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteOutlineIcon" aria-label="fontSize large"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5-1-1h-5l-1 1H5v2h14V4z"></path></svg>`,
        },

    ];
    for (let i = 0; i < cellItems.length; i++) {
        const element = cellItems[i];
        let dom = document.createElement("span");
        let tooltip = document.createElement("span");

        dom.innerHTML = element.svg;
        dom.className = `cellcommand`;
        tooltip.textContent = element.text;
        tooltip.className = `tooltiptext`;
        dom.appendChild(tooltip);
        wrapDiv.appendChild(dom);

        dom.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            store.dispatch(setCellCommand(element.cellCommand));
        });
    }

    /** widget of the next cell will also has the top boundary to mark the end of prev cell */
    wrapDiv.className = "cellwidget celllastline " + activeClass;
    wrapDiv.id = `cellwidget-${groupID}`;

    let zone = null;
    if (endBoundaryWidget) {
        zone = {
            afterLineNumber: afterLineNumber + 1,
            heightInLines: 0, // yes this is 0, this is not a bug
            domNode: wrapDiv,
        };
    } else {
        zone = {
            afterLineNumber: afterLineNumber,
            heightInLines: 2,
            domNode: wrapDiv,
        };
    }

    return zone;
};

const widgetViewZones = [];

const addCellWidgets = (changeAccessor) => {
    // remove existing view zones
    for (let viewZoneId of widgetViewZones) changeAccessor.removeZone(viewZoneId);

    let state = store.getState();
    const activeGroup = state.codeEditor.activeGroup;
    let inViewID = state.projectManager.inViewID;
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(state);
        // console.log("Monaco: ", lines);
        if (lines && lines.length > 0) {
            let currentGroupID = null;
            for (let ln = 0; ln < lines.length; ln++) {
                if (!lines[ln].generated) {
                    const groupID = lines[ln].groupID;
                    const active_clazz = activeGroup === groupID ? "active show-toolbar" : "";
                    let zone = null;
                    if (groupID) {
                        if (groupID != currentGroupID) {
                            zone = createCellWidgetDom(groupID, ln, false, active_clazz);
                            if (zone) {
                                let viewZoneId = changeAccessor.addZone(zone);
                                widgetViewZones.push(viewZoneId);
                            }
                        }

                        if (ln + 1 === lines.length) {
                            /** add a special widget here if the line and also the last cell
                             * this is used to marked the end boundary of the cell */
                            zone = createCellWidgetDom(groupID, ln, true, "");
                            if (zone) {
                                let viewZoneId = changeAccessor.addZone(zone);
                                widgetViewZones.push(viewZoneId);
                            }
                        }
                    }
                }
                currentGroupID = lines[ln].groupID;
            }
        }
    }
};

export const setCellWidgets = (editor) => {
    editor.changeViewZones(addCellWidgets);
};
