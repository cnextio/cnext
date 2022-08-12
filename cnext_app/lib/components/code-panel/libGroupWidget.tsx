import { insertNewlineAndIndent } from "@codemirror/commands";
import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { useDispatch, useSelector } from "react-redux";
import { clearTextOutputs, setCellCommand } from "../../../redux/reducers/CodeEditorRedux";
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
            const cells = [
                {
                    name: "Run",
                    cellCommand: CellCommand.RUN_CELL,
                },
                {
                    name: "Clear Result",
                    cellCommand: CellCommand.CLEAR,
                },
                {
                    name: "Add Cell",
                    cellCommand: CellCommand.ADD_CELL,
                },
            ];
            for (let i = 0; i < cells.length; i++) {
                const element = cells[i];
                let dom = document.createElement("span");
                dom.textContent = element.name;
                dom.className = `cm-cell-command`;
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
    const mouseOverGroupID = store.getState().codeEditor.mouseOverGroupID;
    const view = new EditorView();
    console.log(`state.doc.lines`, store.getState());

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
