import {
    EditorView,
    Decoration,
    WidgetType,
} from "@codemirror/view";
import store from "../../../redux/store";
import { ICodeLine } from "../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

class GroupWidget extends WidgetType {
    toDOM() {
        let wrap = document.createElement("div");
        wrap.className = "cm-groupwidget";
        return wrap;
    }
}

export const groupWidgetExtension = EditorView.decorations.compute(["doc"], (state) => {
    let widgets = [];
    let reduxState = store.getState();
    let inViewID = reduxState.projectManager.inViewID;
    if (inViewID) {
        let lines: ICodeLine[] | null = getCodeLine(reduxState);
        if (lines && state.doc.lines === lines.length) {
            let currentGroupID = null;
            for (let ln = 0; ln < lines.length; ln++) {
                /** convert to 1-based */
                let line = state.doc.line(ln + 1);
                if (!lines[ln].generated ) {
                    if (lines[ln].groupID != currentGroupID) {
                        let widget = Decoration.widget({
                            widget: new GroupWidget(),
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
};