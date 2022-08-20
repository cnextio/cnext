import { StateEffect, StateField, TransactionSpec } from "@codemirror/state";
import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { setCellCommand } from "../../../redux/reducers/CodeEditorRedux";
import store from "../../../redux/store";
import { ICodeLine, CellCommand } from "../../interfaces/ICodeEditor";
import { getCodeLine } from "./libCodeEditor";

export const cellWidgetStateEffect = StateEffect.define<number>();
export const cellWidgetStateField = StateField.define({
    create: () => 0,
    update(value, tr) {
        for (let e of tr.effects) {
            if (e.is(cellWidgetStateEffect)) {
                value += 1;
            }
        }
        return value;
    },
});

class CellWidget extends WidgetType {
    constructor(readonly groupId: string | undefined) {
        super();
    }
    toDOM() {
        const mouseOverGroupID = store.getState().codeEditor.mouseOverGroupID;
        let wrap = document.createElement("div");
        if (mouseOverGroupID && mouseOverGroupID === this.groupId) {
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
                dom.className = `cm-cellcommand`;
                tooltip.textContent = element.text;
                tooltip.className = `tooltiptext`;
                dom.appendChild(tooltip);
                wrap.appendChild(dom);

                dom.addEventListener("mousedown", (e) => {
                    e.stopPropagation();
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

export const cellWidgetExtension = EditorView.decorations.compute(
    ["doc", cellWidgetStateField],
    (state) => {
        let widgets = [];
        let reduxState = store.getState();
        let inViewID = reduxState.projectManager.inViewID;
        if (inViewID) {
            let lines: ICodeLine[] | null = getCodeLine(reduxState);
            // const mouseOverGroupID = useSelector((state: RootState) => state.codeEditor.mouseOverGroupID);
            if (lines && state.doc.lines === lines.length) {
                // console.log("CodeEditor libGroupWidget +++++");
                let currentGroupID = null;
                for (let ln = 0; ln < lines.length; ln++) {
                    /** convert to 1-based */
                    let line = state.doc.line(ln + 1);
                    if (!lines[ln].generated) {
                        if (lines[ln].groupID != currentGroupID) {
                            // console.log("CodeEditor libGroupWidget line.from ", line.from);
                            let widget = Decoration.widget({
                                widget: new CellWidget(lines[ln].groupID),
                                side: -1,
                                block: true,
                            });
                            widgets.push(widget.range(line.from));
                        }
                    }
                    currentGroupID = lines[ln].groupID;
                }
            }
        }

        // console.log("CodeEditor libGroupWidget widgets.length: ", widgets.length);
        return Decoration.set(widgets);
    }
);

export const setCodeMirrorCellWidget = (view: EditorView) => {
    // temp fix for the scrolling issue due to rerendering
    let scrollEl = document.querySelector("div.cm-scroller") as HTMLElement;
    scrollEl.classList.add("stop-scrolling");
    let oldScroll = scrollEl.scrollTop;
    let oldHeight = scrollEl.scrollHeight;

    let transactionSpec: TransactionSpec = {
        effects: cellWidgetStateEffect.of(0),
    };
    view.dispatch(view.state.update(transactionSpec));

    // temp fix for the scrolling issue due to rerendering
    setTimeout(() => {
        scrollEl.scrollTop = oldScroll + scrollEl.scrollHeight - oldHeight;
        scrollEl.classList.remove("stop-scrolling");
    }, 0);
};

export function cellWidget() {
    return cellWidgetExtension;
}
