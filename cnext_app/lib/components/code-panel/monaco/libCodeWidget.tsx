import { setCellCommand } from "../../../../redux/reducers/CodeEditorRedux";
import store, { RootState } from "../../../../redux/store";
import { CellCommand, ICodeLine } from "../../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

const viewZones = [];

const createCellWidgetDom = (groupID: string) => {
    let wrap = document.createElement("div");
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
        wrap.appendChild(dom);

        dom.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            console.log(`2323`);
            
            store.dispatch(setCellCommand(element.cellCommand));
        });
    }

    wrap.className = `groupwidget show`;
    wrap.id = `groupwidget-${groupID}`;

    return wrap;
};
const addCellWidgets = (changeAccessor) => {
    // remove existing view zones
    for (let viewZoneId of viewZones) changeAccessor.removeZone(viewZoneId);

    let reduxState = store.getState();
    let inViewID = reduxState.projectManager.inViewID;
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(reduxState);
        // console.log("Monaco: ", lines);
        if (lines) {
            let currentGroupID = null;
            for (let ln = 0; ln < lines.length; ln++) {
                /** convert to 1-based */
                if (!lines[ln].generated) {
                    const groupID = lines[ln].groupID;
                    if (groupID && groupID != currentGroupID) {
                        var domNode = createCellWidgetDom(groupID);
                        let zone = {
                            afterLineNumber: ln,
                            heightInLines: 1,
                            domNode: domNode,
                        };
                        // console.log("Monaco: ", zone);
                        let viewZoneId = changeAccessor.addZone(zone);
                        viewZones.push(viewZoneId);
                    }
                }
                currentGroupID = lines[ln].groupID;
            }
        }
    }
};

export const setEditorWidgets = (state: RootState, editor) => {
    editor.changeViewZones(addCellWidgets);
};
