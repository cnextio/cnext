import { StateEffect, StateField, TransactionSpec } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";
import store from "../../../redux/store";
import { ICodeLine } from "../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

const cellCSS = (clazz: string) => Decoration.line({ attributes: { class: clazz } });

export const cellDecoStateEffect = StateEffect.define<number>();

export const cellDecoStateField = StateField.define({
    create: () => 0,
    update(value, tr) {
        for (let e of tr.effects) {
            if (e.is(cellDecoStateEffect)) {
                value += 1;
            }
        }
        return value;
    },
});

export const cellDecoExtension = EditorView.decorations.compute(
    ["doc", cellDecoStateField],
    (state) => {
        let lineBackgrounds = [];
        let reduxState = store.getState();
        const activeGroup = store.getState().codeEditor.activeGroup;
        
        let inViewID = reduxState.projectManager.inViewID;
        if (inViewID) {
            let lines: ICodeLine[] | null = getCodeLine(reduxState);
            if (lines && state.doc.lines === lines.length) {
                let currentGroupID = null;
                for (let ln = 0; ln < lines.length; ln++) {
                    /** convert to 1-based */
                    let line = state.doc.line(ln + 1);
                    if (!lines[ln].generated && lines[ln].groupID != null) {
                        const active_clazz =
                            activeGroup === lines[ln].groupID ? "active" : "";
                        if (lines[ln].groupID != currentGroupID) {
                            lineBackgrounds.push(
                                    cellCSS(
                                        "cm-groupedfirstline " + active_clazz
                                    ).range(line.from)
                                );
                        } else {
                            // console.log('CodeEditor grouped line deco');
                            lineBackgrounds.push(
                                cellCSS("cm-groupedline " + active_clazz).range(
                                    line.from
                                )
                            );
                        }
                        if (
                            /** this is the last line */
                            ln + 1 === lines.length ||
                            /** next line belongs to a different group */
                            lines[ln].groupID !== lines[ln + 1].groupID
                        ) {
                            lineBackgrounds.push(
                                cellCSS("cm-groupedlastline " + active_clazz).range(
                                    line.from
                                )
                            );
                        }
                    }
                    currentGroupID = lines[ln].groupID;
                }
            }
        }
        return Decoration.set(lineBackgrounds);
    }    
);

export const setCodeMirrorCellDeco = (view: EditorView) => {
    let transactionSpec: TransactionSpec = {
        effects: cellDecoStateEffect.of(0),
    };
    view.dispatch(view.state.update(transactionSpec));
}

export function cellDeco() {
    return cellDecoExtension;
}
