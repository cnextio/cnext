import { StateEffect, StateField } from '@codemirror/state';
import { showTooltip } from '@codemirror/tooltip';
import { ViewPlugin } from '@codemirror/view';
import { CompletionContext } from './autocomplete';

export const closeSignatureEffect = /*@__PURE__*/ StateEffect.define();
class SignaturePlugin {
    constructor(view, source, setSignature, countDocChanges) {
        this.view = view;
        this.source = source;
        this.setSignature = setSignature;
        this.signatureTimeout = -1;
        this.curPos = this.view.state.selection.main.head;
        this.countDocChanges = countDocChanges;
        this.currentData = null;
        this.moved = null;
        view.dom.addEventListener('mousedown', (this.mousedown = this.mousedown.bind(this)));
        view.dom.addEventListener('mousemove', (this.mousemove = this.mousemove.bind(this)));
        view.dom.addEventListener('mouseup', (this.mouseup = this.mouseup.bind(this)));
    }

    update(update) {
        let sState = update.state;
        let pos = sState.selection.main.head;

        if (pos !== 0 && this.curPos != pos) {
            this.curPos = pos;
            this.signatureTimeout = setTimeout(() => this.startGetSignature(sState, pos), 100);
        }
    }

    startGetSignature(state, pos) {
        clearTimeout(this.signatureTimeout);
        const line = state.doc.lineAt(pos);
        const context = new CompletionContext(state, pos, true);
        this.excuteSource(context, line, pos - line.from - 1);
    }

    mousemove() {
        if (this.moved) {
            clearTimeout(this.signatureTimeout);
            this.view.dispatch({
                effects: closeSignatureEffect.of(null),
            });
            this.signatureTimeout = -1;
        }
    }

    mouseup() {
        this.moved = false;
    }

    mousedown() {
        this.moved = true;
        clearTimeout(this.signatureTimeout);
        this.view.dispatch({
            effects: closeSignatureEffect.of(null),
        });
        this.signatureTimeout = -1;
    }

    async excuteSource(context, line, cursorIndexInLine) {
        for (let i = cursorIndexInLine; i > 0; i--) {
            if (line.text[i] === '(') {
                const subStr = line.text.substring(i, cursorIndexInLine + 1);
                const closeIndex = subStr.indexOf(')');

                // detect out side of ')'
                if (closeIndex !== -1 && closeIndex + i <= cursorIndexInLine) {
                    this.view.dispatch({
                        effects: closeSignatureEffect.of(null),
                    });
                    return;
                }

                // send source request when needed
                if (context.matchBefore(/[(,]+$/)) {
                    let data = await this.source(this.view, this.curPos);
                    if (data) {
                        this.currentData = {
                            ...data,
                            lineNumber: line.number,
                            pos: context.pos,
                        };
                        this.view.dispatch({ effects: this.setSignature.of(this.currentData) });
                    }
                } else if (context.matchBefore(/['"]+$/)) {
                    // escape case for dfFilter
                    this.view.dispatch({
                        effects: closeSignatureEffect.of(null),
                    });
                } else if (this.currentData) {
                    this.view.dispatch({
                        effects: this.setSignature.of({
                            ...this.currentData,
                            lineNumber: line.number,
                            pos: context.pos,
                            activeParameter: subStr.split(',').length - 1,
                        }),
                    });
                }
                return;
            } else {
                this.view.dispatch({
                    effects: closeSignatureEffect.of(null),
                });
            }
        }
    }

    destroy() {
        clearTimeout(this.signatureTimeout);
    }
}

export const signatureTooltip = (source) => {
    let setSignature = StateEffect.define();
    let signatureState = StateField.define({
        create() {
            return null;
        },
        update(value, tr) {
            let tooltip;
            for (let effect of tr.effects) {
                if (effect.is(setSignature)) {
                    tooltip = effect.value;
                } else if (effect.is(closeSignatureEffect)) {
                    return null;
                }
            }

            if (tooltip) {
                return {
                    pos: tooltip.pos,
                    above: tooltip.lineNumber > 5,
                    strictSide: true,
                    create: () => {
                        const activeParameter = tooltip.activeParameter;
                        const content = tooltip.textContent;
                        const start = content.indexOf('(') + 1;
                        const end = content.indexOf(')');
                        const paramTexts = content.substring(start, end).split(',');

                        const dom = document.createElement('div');
                        dom.className = 'cm-tooltip-signature';

                        const startSpan = document.createElement('span');
                        startSpan.textContent = '(';

                        // header
                        const header = document.createElement('div');
                        header.appendChild(startSpan);
                        for (let i = 0; i < paramTexts.length; i++) {
                            const element = document.createElement('span');
                            if (activeParameter === i)
                                element.className = 'cm-tooltip-signature-element';

                            if (i !== paramTexts.length - 1)
                                element.textContent = paramTexts[i] + ',';
                            else element.textContent = paramTexts[i] + ')';
                            header.append(element);
                        }
                        dom.appendChild(header);

                        // content
                        const container = document.createElement('div');
                        const textSpan = document.createElement('span');
                        container.textContent = tooltip.documentText;
                        container.className = 'cm-tooltip-signature-doc';
                        container.appendChild(textSpan);
                        dom.appendChild(container);

                        return { dom };
                    },
                };
            }

            return value;
        },
        provide: (f) => showTooltip.from(f),
    });
    return [
        signatureState,
        ViewPlugin.define((view) => new SignaturePlugin(view, source, setSignature)),
    ];
};
