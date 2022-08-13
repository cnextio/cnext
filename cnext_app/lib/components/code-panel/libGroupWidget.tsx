import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { setCellCommand } from "../../../redux/reducers/CodeEditorRedux";
import store, { RootState } from "../../../redux/store";
import { ICodeLine, CellCommand } from "../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

class GroupWidget extends WidgetType {
    constructor(readonly groupId: string | undefined) {
        super();
    }
    toDOM() {
        const mouseOverGroupID = store.getState().codeEditor.mouseOverGroupID;
        let wrap = document.createElement("div");
        if (mouseOverGroupID && mouseOverGroupID === this.groupId) {
            const cellItems = [
                {
                    text: "Run",
                    cellCommand: CellCommand.RUN_CELL,
                    svg: `<svg class="icon-cellcommand MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="PlayArrowIcon"><path d="M8 5v14l11-7z"></path></svg>`,
                },
                {
                    text: "Clear Result",
                    cellCommand: CellCommand.CLEAR,
                    svg: `<svg class="icon-cellcommand MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="DeleteIcon"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`,
                },
                {
                    text: "Add Cell",
                    cellCommand: CellCommand.ADD_CELL,
                    svg: `<svg class="icon-cellcommand MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="AddIcon"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>`,
                },
            ];
            for (let i = 0; i < cellItems.length; i++) {
                const element = cellItems[i];
                let dom = document.createElement("span");
                dom.innerHTML = element.svg;
                dom.className = `cm-cellcommand`;
                wrap.appendChild(dom);
                dom.addEventListener("click", () => {
                    store.dispatch(setCellCommand(element.cellCommand));
                });
            }
        }
        wrap.className = `cm-groupwidget ${
            mouseOverGroupID && mouseOverGroupID === this.groupId ? "show" : ""
        }`;
        return wrap;
    }
}

export const groupWidgetExtension = EditorView.decorations.compute(["doc"], (state) => {
    let widgets = [];
    let reduxState = store.getState();
    const view = new EditorView();
    let inViewID = reduxState.projectManager.inViewID;
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(reduxState);
        // const mouseOverGroupID = useSelector((state: RootState) => state.codeEditor.mouseOverGroupID);
        if (lines && state.doc.lines === lines.length) {
            let currentGroupID = null;
            for (let ln = 0; ln < lines.length; ln++) {
                /** convert to 1-based */
                let line = state.doc.line(ln + 1);
                if (!lines[ln].generated) {
                    if (lines[ln].groupID != currentGroupID) {
                        let widget = Decoration.widget({
                            widget: new GroupWidget(lines[ln].groupID),
                            side: -1,
                            block: true,
                        });
                        widgets.push(widget.range(line.from));
                    } else {
                    }
                    if (
                        /** this is the last line */
                        ln + 1 === lines.length ||
                        /** next line belongs to a different group */
                        lines[ln].groupID !== lines[ln + 1].groupID
                    ) {
                        // marks.push(lastLineOfGroupMarker.range(line.from));
                    }
                }
                currentGroupID = lines[ln].groupID;
            }
        }
    }
    return Decoration.set(widgets);
});

export function groupWidget() {
    return groupWidgetExtension;
}
