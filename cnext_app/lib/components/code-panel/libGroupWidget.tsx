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
        let reduxState = store.getState();

        const mouseOverGroupID = store.getState().codeEditor.mouseOverGroupID;
        let wrap = document.createElement("div");
        if (mouseOverGroupID === this.groupId) {
            const that = this;
            //run
            let run = document.createElement("span");
            document.removeEventListener("name-of-event", () => {}, false);
            run.textContent = "Run";
            run.className = "run-shell";
            wrap.appendChild(run);

            run.addEventListener("click", () => {
                store.dispatch(setCellCommand(CellCommand.RUN_CELL));
            });

            //clear
            let clear = document.createElement("span");
            clear.textContent = "Clear Result";
            clear.className = "clear-result";
            wrap.appendChild(clear);
            clear.addEventListener("click", () => {
                store.dispatch(setCellCommand(CellCommand.CLEAR));
            });

            // add-shell

            let addCell = document.createElement("span");
            addCell.textContent = "Add Cell";
            addCell.className = "add-cell";
            wrap.appendChild(addCell);

            addCell.addEventListener("click", () => {
                store.dispatch(setCellCommand(CellCommand.ADD_CELL));
            });
        }
        wrap.className = `cm-groupwidget ${mouseOverGroupID === this.groupId ? "show" : ""}`;
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
