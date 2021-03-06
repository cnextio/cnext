import {
    Facet,
    combineConfig,
    StateEffect,
    StateField,
    Text,
    EditorSelection,
    Prec,
} from '@codemirror/state';
import {
    EditorView,
    Direction,
    logException,
    ViewPlugin,
    Decoration,
    WidgetType,
    keymap,
} from '@codemirror/view';
import { showTooltip } from '@codemirror/tooltip';
import { syntaxTree, indentUnit } from '@codemirror/language';
import { codePointAt, codePointSize, fromCodePoint } from '@codemirror/text';
import { closeSignatureEffect } from '../signature';
import { MaxInfoWidth } from '../source';

/**
An instance of this is passed to completion source functions.
*/
class CompletionContext {
    /**
    Create a new completion context. (Mostly useful for testing
    completion sources—in the editor, the extension will create
    these for you.)
    */
    constructor(
        /**
    The editor state that the completion happens in.
    */
        state,
        /**
    The position at which the completion is happening.
    */
        pos,
        /**
    Indicates whether completion was activated explicitly, or
    implicitly by typing. The usual way to respond to this is to
    only return completions when either there is part of a
    completable entity before the cursor, or `explicit` is true.
    */
        explicit
    ) {
        this.state = state;
        this.pos = pos;
        this.explicit = explicit;
        /**
        @internal
        */
        this.abortListeners = [];
    }
    /**
    Get the extent, content, and (if there is a token) type of the
    token before `this.pos`.
    */
    tokenBefore(types) {
        let token = syntaxTree(this.state).resolveInner(this.pos, -1);
        while (token && types.indexOf(token.name) < 0) token = token.parent;
        return token
            ? {
                  from: token.from,
                  to: this.pos,
                  text: this.state.sliceDoc(token.from, this.pos),
                  type: token.type,
              }
            : null;
    }
    /**
    Get the match of the given expression directly before the
    cursor.
    */
    matchBefore(expr) {
        let line = this.state.doc.lineAt(this.pos);
        let start = Math.max(line.from, this.pos - 250);
        let str = line.text.slice(start - line.from, this.pos - line.from);
        let found = str.search(ensureAnchor(expr, false));
        return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
    }
    /**
    Yields true when the query has been aborted. Can be useful in
    asynchronous queries to avoid doing work that will be ignored.
    */
    get aborted() {
        return this.abortListeners == null;
    }
    /**
    Allows you to register abort handlers, which will be called when
    the query is
    [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
    */
    addEventListener(type, listener) {
        if (type == 'abort' && this.abortListeners) this.abortListeners.push(listener);
    }
}
function toSet(chars) {
    let flat = Object.keys(chars).join('');
    let words = /\w/.test(flat);
    if (words) flat = flat.replace(/\w/g, '');
    return `[${words ? '\\w' : ''}${flat.replace(/[^\w\s]/g, '\\$&')}]`;
}
function prefixMatch(options) {
    let first = Object.create(null),
        rest = Object.create(null);
    for (let { label } of options) {
        first[label[0]] = true;
        for (let i = 1; i < label.length; i++) rest[label[i]] = true;
    }
    let source = toSet(first) + toSet(rest) + '*$';
    return [new RegExp('^' + source), new RegExp(source)];
}
/**
Given a a fixed array of options, return an autocompleter that
completes them.
*/
function completeFromList(list) {
    let options = list.map((o) => (typeof o == 'string' ? { label: o } : o));
    let [span, match] = options.every((o) => /^\w+$/.test(o.label))
        ? [/\w*$/, /\w+$/]
        : prefixMatch(options);
    return (context) => {
        let token = context.matchBefore(match);
        return token || context.explicit
            ? { from: token ? token.from : context.pos, options, span }
            : null;
    };
}
/**
Wrap the given completion source so that it will only fire when the
cursor is in a syntax node with one of the given names.
*/
function ifIn(nodes, source) {
    return (context) => {
        for (
            let pos = syntaxTree(context.state).resolveInner(context.pos, -1);
            pos;
            pos = pos.parent
        )
            if (nodes.indexOf(pos.name) > -1) return source(context);
        return null;
    };
}
/**
Wrap the given completion source so that it will not fire when the
cursor is in a syntax node with one of the given names.
*/
function ifNotIn(nodes, source) {
    return (context) => {
        for (
            let pos = syntaxTree(context.state).resolveInner(context.pos, -1);
            pos;
            pos = pos.parent
        )
            if (nodes.indexOf(pos.name) > -1) return null;
        return source(context);
    };
}
class Option {
    constructor(completion, source, match) {
        this.completion = completion;
        this.source = source;
        this.match = match;
    }
}
function cur(state) {
    return state.selection.main.head;
}
// Make sure the given regexp has a $ at its end and, if `start` is
// true, a ^ at its start.
function ensureAnchor(expr, start) {
    var _a;
    let { source } = expr;
    let addStart = start && source[0] != '^',
        addEnd = source[source.length - 1] != '$';
    if (!addStart && !addEnd) return expr;
    return new RegExp(
        `${addStart ? '^' : ''}(?:${source})${addEnd ? '$' : ''}`,
        (_a = expr.flags) !== null && _a !== void 0 ? _a : expr.ignoreCase ? 'i' : ''
    );
}
function applyCompletion(view, option) {
    let apply = option.completion.apply || option.completion.label;
    let result = option.source;
    if (typeof apply == 'string') {
        view.dispatch({
            changes: { from: result.from, to: result.to, insert: apply },
            selection: { anchor: result.from + apply.length },
            userEvent: 'input.complete',
        });
    } else {
        apply(view, option.completion, result.from, result.to);
    }
}
const SourceCache = /*@__PURE__*/ new WeakMap();
function asSource(source) {
    if (!Array.isArray(source)) return source;
    let known = SourceCache.get(source);
    if (!known) SourceCache.set(source, (known = completeFromList(source)));
    return known;
}

// A pattern matcher for fuzzy completion matching. Create an instance
// once for a pattern, and then use that to match any number of
// completions.
class FuzzyMatcher {
    constructor(pattern) {
        this.pattern = pattern;
        this.chars = [];
        this.folded = [];
        // Buffers reused by calls to `match` to track matched character
        // positions.
        this.any = [];
        this.precise = [];
        this.byWord = [];
        for (let p = 0; p < pattern.length; ) {
            let char = codePointAt(pattern, p),
                size = codePointSize(char);
            this.chars.push(char);
            let part = pattern.slice(p, p + size),
                upper = part.toUpperCase();
            this.folded.push(codePointAt(upper == part ? part.toLowerCase() : upper, 0));
            p += size;
        }
        this.astral = pattern.length != this.chars.length;
    }
    // Matches a given word (completion) against the pattern (input).
    // Will return null for no match, and otherwise an array that starts
    // with the match score, followed by any number of `from, to` pairs
    // indicating the matched parts of `word`.
    //
    // The score is a number that is more negative the worse the match
    // is. See `Penalty` above.
    match(word) {
        if (this.pattern.length == 0) return [0];
        if (word.length < this.pattern.length) return null;
        let { chars, folded, any, precise, byWord } = this;
        // For single-character queries, only match when they occur right
        // at the start
        if (chars.length == 1) {
            let first = codePointAt(word, 0);
            return first == chars[0]
                ? [0, 0, codePointSize(first)]
                : first == folded[0]
                ? [-200 /* CaseFold */, 0, codePointSize(first)]
                : null;
        }
        let direct = word.indexOf(this.pattern);
        if (direct == 0) return [0, 0, this.pattern.length];
        let len = chars.length,
            anyTo = 0;
        if (direct < 0) {
            for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
                let next = codePointAt(word, i);
                if (next == chars[anyTo] || next == folded[anyTo]) any[anyTo++] = i;
                i += codePointSize(next);
            }
            // No match, exit immediately
            if (anyTo < len) return null;
        }
        // This tracks the extent of the precise (non-folded, not
        // necessarily adjacent) match
        let preciseTo = 0;
        // Tracks whether there is a match that hits only characters that
        // appear to be starting words. `byWordFolded` is set to true when
        // a case folded character is encountered in such a match
        let byWordTo = 0,
            byWordFolded = false;
        // If we've found a partial adjacent match, these track its state
        let adjacentTo = 0,
            adjacentStart = -1,
            adjacentEnd = -1;
        let hasLower = /[a-z]/.test(word);
        // Go over the option's text, scanning for the various kinds of matches
        for (
            let i = 0, e = Math.min(word.length, 200), prevType = 0 /* NonWord */;
            i < e && byWordTo < len;

        ) {
            let next = codePointAt(word, i);
            if (direct < 0) {
                if (preciseTo < len && next == chars[preciseTo]) precise[preciseTo++] = i;
                if (adjacentTo < len) {
                    if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
                        if (adjacentTo == 0) adjacentStart = i;
                        adjacentEnd = i;
                        adjacentTo++;
                    } else {
                        adjacentTo = 0;
                    }
                }
            }
            let ch,
                type =
                    next < 0xff
                        ? (next >= 48 && next <= 57) || (next >= 97 && next <= 122)
                            ? 2 /* Lower */
                            : next >= 65 && next <= 90
                            ? 1 /* Upper */
                            : 0 /* NonWord */
                        : (ch = fromCodePoint(next)) != ch.toLowerCase()
                        ? 1 /* Upper */
                        : ch != ch.toUpperCase()
                        ? 2 /* Lower */
                        : 0; /* NonWord */
            if (
                ((type == 1 /* Upper */ && hasLower) ||
                    (prevType == 0 /* NonWord */ && type != 0)) /* NonWord */ &&
                (chars[byWordTo] == next || (folded[byWordTo] == next && (byWordFolded = true)))
            )
                byWord[byWordTo++] = i;
            prevType = type;
            i += codePointSize(next);
        }
        if (byWordTo == len && byWord[0] == 0)
            return this.result(
                -100 /* ByWord */ + (byWordFolded ? -200 /* CaseFold */ : 0),
                byWord,
                word
            );
        if (adjacentTo == len && adjacentStart == 0) return [-200 /* CaseFold */, 0, adjacentEnd];
        if (direct > -1) return [-700 /* NotStart */, direct, direct + this.pattern.length];
        if (adjacentTo == len)
            return [-200 /* CaseFold */ + -700 /* NotStart */, adjacentStart, adjacentEnd];
        if (byWordTo == len)
            return this.result(
                -100 /* ByWord */ + (byWordFolded ? -200 /* CaseFold */ : 0) + -700 /* NotStart */,
                byWord,
                word
            );
        return chars.length == 2
            ? null
            : this.result(
                  (any[0] ? -700 /* NotStart */ : 0) + -200 /* CaseFold */ + -1100 /* Gap */,
                  any,
                  word
              );
    }
    result(score, positions, word) {
        let result = [score],
            i = 1;
        for (let pos of positions) {
            let to = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
            if (i > 1 && result[i - 1] == pos) result[i - 1] = to;
            else {
                result[i++] = pos;
                result[i++] = to;
            }
        }
        return result;
    }
}

const completionConfig = /*@__PURE__*/ Facet.define({
    combine(configs) {
        return combineConfig(
            configs,
            {
                activateOnTyping: true,
                override: null,
                maxRenderedOptions: 100,
                defaultKeymap: true,
                optionClass: () => '',
                icons: true,
                addToOptions: [],
            },
            {
                defaultKeymap: (a, b) => a && b,
                icons: (a, b) => a && b,
                optionClass: (a, b) => (c) => joinClass(a(c), b(c)),
                addToOptions: (a, b) => a.concat(b),
            }
        );
    },
});
function joinClass(a, b) {
    return a ? (b ? a + ' ' + b : a) : b;
}

function optionContent(config) {
    let content = config.addToOptions.slice();
    if (config.icons)
        content.push({
            render(completion) {
                // let icon = document.createElement('img');
                // icon.src = '../icons/cube.svg';
                // icon.className = 'cm-completion-icon';
                // icon.setAttribute('aria-hidden', 'true');
                // return icon;
                let icon = document.createElement('div');
                icon.classList.add('cm-completionIcon');
                if (completion.type)
                    icon.classList.add(
                        ...completion.type.split(/\s+/g).map((cls) => 'cm-completionIcon-' + cls)
                    );
                icon.setAttribute('aria-hidden', 'true');
                return icon;
            },
            position: 20,
        });
    content.push(
        {
            render(completion, _s, match) {
                let labelSpan = document.createElement('span');
                labelSpan.className = 'cm-completionLabel';
                let { label } = completion,
                    off = 0;
                for (let j = 1; j < match.length; ) {
                    let from = match[j++],
                        to = match[j++];
                    if (from > off)
                        labelSpan.appendChild(document.createTextNode(label.slice(off, from)));
                    let span = labelSpan.appendChild(document.createElement('span'));
                    span.appendChild(document.createTextNode(label.slice(from, to)));
                    span.className = 'cm-completionMatchedText';
                    off = to;
                }
                if (off < label.length)
                    labelSpan.appendChild(document.createTextNode(label.slice(off)));

                return labelSpan;
            },
            position: 50,
        },
        {
            render(completion) {
                if (!completion.detail) return null;
                let detailSpan = document.createElement('span');
                detailSpan.className = 'cm-completionDetail';
                detailSpan.textContent = completion.detail;
                return detailSpan;
            },
            position: 80,
        }
    );
    return content.sort((a, b) => a.position - b.position).map((a) => a.render);
}

function createDocContentDom(option) {
    let dom = document.createElement('div');
    dom.id = 'code-doc-content';
    dom.className = 'cm-tooltip cm-completionInfo';
    let { info } = option.completion;
    dom.textContent = info;
    return dom;
}

function rangeAroundSelected(total, selected, max) {
    if (total <= max) return { from: 0, to: total };
    if (selected <= total >> 1) {
        let off = Math.floor(selected / max);
        return { from: off * max, to: (off + 1) * max };
    }
    let off = Math.floor((total - selected) / max);
    return { from: total - (off + 1) * max, to: total - off * max };
}

let isShowMoreInfo = false;
class CompletionTooltip {
    constructor(view, stateField) {
        this.view = view;
        this.stateField = stateField;
        this.info = null;
        this.placeInfo = {
            read: () => this.measureInfo(),
            write: (pos) => this.positionInfo(pos),
            key: this,
        };
        let cState = view.state.field(stateField);
        let { options, selected } = cState.open;
        let config = view.state.facet(completionConfig);
        this.optionContent = optionContent(config);
        this.optionClass = config.optionClass;
        this.range = rangeAroundSelected(options.length, selected, config.maxRenderedOptions);

        this.dom = document.createElement('div');
        this.dom.className = 'cm-tooltip-autocomplete';

        this.list = this.dom.appendChild(this.createListBox(options, cState.id, this.range));
        this.list.addEventListener('scroll', () => {
            if (this.info) this.view.requestMeasure(this.placeInfo);
        });
    }

    mount() {
        this.updateSel();
    }

    update(update) {
        if (update.state.field(this.stateField) != update.startState.field(this.stateField))
            this.updateSel();
    }

    positioned() {
        if (this.info) this.view.requestMeasure(this.placeInfo);
    }

    updateSel() {
        let cState = this.view.state.field(this.stateField),
            open = cState.open;
        if (open.selected < this.range.from || open.selected >= this.range.to) {
            this.range = rangeAroundSelected(
                open.options.length,
                open.selected,
                this.view.state.facet(completionConfig).maxRenderedOptions
            );
            this.list.remove();
            this.list = this.dom.appendChild(
                this.createListBox(open.options, cState.id, this.range)
            );
            this.list.addEventListener('scroll', () => {
                if (this.info) this.view.requestMeasure(this.placeInfo);
            });
        }
        let option = open.options[open.selected];
        if (this.updateSelectedOption(option, open.selected)) {
            if (this.info) {
                this.info.remove();
                this.info = null;
            }
        }
    }
    updateSelectedOption(option, selected) {
        let set = null;
        for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
            const matchText = opt.querySelector('.cm-completionMatchedText');
            //const icon = opt.querySelector('.cm-completion-icon');
            let { info } = option.completion;

            if (i == selected) {
                if (!opt.hasAttribute('aria-selected')) {
                    opt.setAttribute('aria-selected', 'true');
                    set = opt;

                    if (info) {
                        const moreBtn = document.createElement('button');
                        moreBtn.className = 'cm-read-more-btn';
                        moreBtn.innerHTML = '&#8250;';
                        moreBtn.setAttribute('title', 'Read more');
                        moreBtn.onclick = (e) => {
                            e.stopPropagation();
                            this._showMoreClick(option);
                        };
                        opt.appendChild(moreBtn);
                        if (isShowMoreInfo) {
                            let codeDocContainerDom = this.dom.querySelector('#code-doc-container');
                            this.showMoreInfo(codeDocContainerDom, option);
                        }
                    }

                    if (matchText) {
                        matchText.style.color = '#62ebff';
                        // icon.setAttribute('src', '../icons/cube-white.svg');
                        // icon.classList.add('cm-completion-icon-selected');
                    }
                }
            } else {
                if (opt.hasAttribute('aria-selected')) {
                    opt.removeAttribute('aria-selected');
                    if (matchText) {
                        matchText.style.color = '#0064b7';
                        // icon.setAttribute('src', '../icons/cube.svg');
                        // icon.setAttribute('class', 'cm-completion-icon');
                    }

                    const btnMore = opt.querySelector('.cm-read-more-btn');
                    if (btnMore) opt.removeChild(btnMore);
                }
            }
        }
        if (set) scrollIntoView(this.list, set);
        return set;
    }

    measureInfo() {
        let sel = this.dom.querySelector('[aria-selected]');
        if (!sel) return null;
        let rect = this.dom.getBoundingClientRect();
        let top = sel.getBoundingClientRect().top - rect.top;
        if (top < 0 || top > this.list.clientHeight - 10) return null;
        let left = this.view.textDirection == Direction.RTL;
        let spaceLeft = rect.left,
            spaceRight = innerWidth - rect.right;
        if (left && spaceLeft < Math.min(MaxInfoWidth, spaceRight)) left = false;
        else if (!left && spaceRight < Math.min(MaxInfoWidth, spaceLeft)) left = true;
        return { top, left };
    }

    positionInfo(pos) {
        if (this.info && pos) {
            this.info.style.top = pos.top + 'px';
            this.info.classList.toggle('cm-completionInfo-left', pos.left);
            this.info.classList.toggle('cm-completionInfo-right', !pos.left);
        }
    }

    createListBox(options, id, range) {
        const ul = document.createElement('ul');
        ul.className = 'cm-list-options';

        ul.id = id;
        ul.setAttribute('role', 'listbox');
        for (let i = range.from; i < range.to; i++) {
            let { completion, match } = options[i];

            const completionClone = {
                ...completion,
                label: completion.apply,
                detail: null,
            };

            const li = ul.appendChild(document.createElement('li'));
            li.id = id + '-' + i;
            li.setAttribute('role', 'option');
            let cls = this.optionClass(completion);
            if (cls) li.className = cls;
            for (let source of this.optionContent) {
                let node = source(completionClone, this.view.state, match);
                if (node) li.appendChild(node);
            }

            li.onclick = () => {
                applyCompletion(this.view, options[i]);
            };
        }

        if (range.from) ul.classList.add('cm-completionListIncompleteTop');
        if (range.to < options.length) ul.classList.add('cm-completionListIncompleteBottom');

        return ul;
    }

    _showMoreClick(option) {
        let codeDocContainerDom = this.dom.querySelector('#code-doc-container');
        if (!codeDocContainerDom) {
            this.showMoreInfo(codeDocContainerDom, option);
            isShowMoreInfo = true;
        } else {
            this.hideInfo(codeDocContainerDom);
            this.isShowMoreInfo = false;
        }
        this.view.focus();
    }

    showMoreInfo(codeDocContainerDom, option) {
        if (!codeDocContainerDom) {
            codeDocContainerDom = this.dom.appendChild(document.createElement('div'));
            codeDocContainerDom.id = 'code-doc-container';
            let { info } = option.completion;
            if (info) codeDocContainerDom.appendChild(createDocContentDom(option));
        }
    }

    hideInfo(codeDocContainerDom) {
        this.dom.removeChild(codeDocContainerDom);
    }
}

// We allocate a new function instance every time the completion
// changes to force redrawing/repositioning of the tooltip
function completionTooltip(stateField) {
    return (view) => new CompletionTooltip(view, stateField);
}

function scrollIntoView(container, element) {
    let parent = container.getBoundingClientRect();
    let self = element.getBoundingClientRect();
    if (self.top < parent.top) container.scrollTop -= parent.top - self.top;
    else if (self.bottom > parent.bottom) container.scrollTop += self.bottom - parent.bottom;
}

const MaxOptions = 300;
// Used to pick a preferred option when two options with the same
// label occur in the result.
function score(option) {
    return (
        (option.boost || 0) * 100 +
        (option.apply ? 10 : 0) +
        (option.info ? 5 : 0) +
        (option.type ? 1 : 0)
    );
}

function sortOptions(active, state) {
    let options = [],
        i = 0;
    for (let a of active)
        if (a.hasResult()) {
            if (a.result.filter === false) {
                for (let option of a.result.options)
                    options.push(new Option(option, a, [1e9 - i++]));
            } else {
                let matcher = new FuzzyMatcher(state.sliceDoc(a.from, a.to)),
                    match;
                for (let option of a.result.options)
                    if ((match = matcher.match(option.label))) {
                        if (option.boost != null) match[0] += option.boost;
                        options.push(new Option(option, a, match));
                    }
            }

            // add more data for completion
            if (paramsOption.length !== 0) {
                for (let option of paramsOption) {
                    options.unshift(new Option(option, a, [1e10 - i++]));
                }
            }
        }

    let result = [],
        prev = null;
    for (let opt of options.sort(cmpOption)) {
        if (result.length == MaxOptions) break;
        if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail)
            result.push(opt);
        else if (score(opt.completion) > score(prev)) result[result.length - 1] = opt;
        prev = opt.completion;
    }

    return result;
}

class CompletionDialog {
    constructor(options, attrs, tooltip, timestamp, selected) {
        this.options = options;
        this.attrs = attrs;
        this.tooltip = tooltip;
        this.timestamp = timestamp;
        this.selected = selected;
    }

    setSelected(selected, id) {
        return selected == this.selected || selected >= this.options.length
            ? this
            : new CompletionDialog(
                  this.options,
                  makeAttrs(id, selected),
                  this.tooltip,
                  this.timestamp,
                  selected
              );
    }

    static build(active, state, id, prev) {
        let options = sortOptions(active, state);
        if (!options.length) return null;
        let selected = 0;
        if (prev && prev.selected) {
            let selectedValue = prev.options[prev.selected].completion;
            for (let i = 0; i < options.length && !selected; i++) {
                if (options[i].completion == selectedValue) selected = i;
            }
        }
        return new CompletionDialog(
            options,
            makeAttrs(id, selected),
            {
                pos: active.reduce((a, b) => (b.hasResult() ? Math.min(a, b.from) : a), 1e8),
                create: completionTooltip(completionState),
            },
            prev ? prev.timestamp : Date.now(),
            selected
        );
    }

    map(changes) {
        return new CompletionDialog(
            this.options,
            this.attrs,
            Object.assign(Object.assign({}, this.tooltip), {
                pos: changes.mapPos(this.tooltip.pos),
            }),
            this.timestamp,
            this.selected
        );
    }
}

class CompletionState {
    constructor(active, id, open) {
        this.active = active;
        this.id = id;
        this.open = open;
    }

    static start() {
        return new CompletionState(
            none,
            'cm-ac-' + Math.floor(Math.random() * 2e6).toString(36),
            null
        );
    }

    update(tr) {
        let { state } = tr,
            conf = state.facet(completionConfig);
        let sources =
            conf.override || state.languageDataAt('autocomplete', cur(state)).map(asSource);
        let active = sources.map((source) => {
            let value =
                this.active.find((s) => s.source == source) ||
                new ActiveSource(
                    source,
                    this.active.some((a) => a.state != 0 /* Inactive */)
                        ? 1 /* Pending */
                        : 0 /* Inactive */
                );
            return value.update(tr, conf);
        });

        if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
            active = this.active;

        let open =
            tr.selection ||
            active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) ||
            !sameResults(active, this.active)
                ? CompletionDialog.build(active, state, this.id, this.open)
                : this.open && tr.docChanged
                ? this.open.map(tr.changes)
                : this.open;
        if (
            !open &&
            active.every((a) => a.state != 1 /* Pending */) &&
            active.some((a) => a.hasResult())
        )
            active = active.map((a) =>
                a.hasResult() ? new ActiveSource(a.source, 0 /* Inactive */) : a
            );
        for (let effect of tr.effects)
            if (effect.is(setSelectedEffect))
                open = open && open.setSelected(effect.value, this.id);

        return active == this.active && open == this.open
            ? this
            : new CompletionState(active, this.id, open);
    }
    get tooltip() {
        return this.open ? this.open.tooltip : null;
    }
    get attrs() {
        return this.open ? this.open.attrs : baseAttrs;
    }
}

function sameResults(a, b) {
    if (a == b) return true;
    for (let iA = 0, iB = 0; ; ) {
        while (iA < a.length && !a[iA].hasResult) iA++;
        while (iB < b.length && !b[iB].hasResult) iB++;
        let endA = iA == a.length,
            endB = iB == b.length;
        if (endA || endB) return endA == endB;
        if (a[iA++].result != b[iB++].result) return false;
    }
}

const baseAttrs = {
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
};

function makeAttrs(id, selected) {
    return {
        'aria-autocomplete': 'list',
        'aria-expanded': 'true',
        'aria-activedescendant': id + '-' + selected,
        'aria-controls': id,
    };
}

const none = [];
function cmpOption(a, b) {
    let dScore = b.match[0] - a.match[0];
    if (dScore) return dScore;
    return a.completion.label.localeCompare(b.completion.label);
}

function getUserEvent(tr) {
    return tr.isUserEvent('input.type')
        ? 'input'
        : tr.isUserEvent('delete.backward')
        ? 'delete'
        : null;
}

class ActiveSource {
    constructor(source, state, explicitPos = -1) {
        this.source = source;
        this.state = state;
        this.explicitPos = explicitPos;
    }
    hasResult() {
        return false;
    }
    update(tr, conf) {
        let event = getUserEvent(tr),
            value = this;
        if (event) value = value.handleUserEvent(tr, event, conf);
        else if (tr.docChanged) value = value.handleChange(tr);
        else if (tr.selection && value.state != 0 /* Inactive */)
            value = new ActiveSource(value.source, 0 /* Inactive */);
        for (let effect of tr.effects)
            if (effect.is(startCompletionEffect))
                value = new ActiveSource(
                    value.source,
                    1 /* Pending */,
                    effect.value ? cur(tr.state) : -1
                );
            else if (effect.is(closeCompletionEffect))
                value = new ActiveSource(value.source, 0 /* Inactive */);
            else if (effect.is(setActiveEffect))
                for (let active of effect.value) if (active.source == value.source) value = active;
        return value;
    }
    handleUserEvent(tr, type, conf) {
        return type == 'delete' || !conf.activateOnTyping
            ? this.map(tr.changes)
            : new ActiveSource(this.source, 1 /* Pending */);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(cur(tr.startState))
            ? new ActiveSource(this.source, 0 /* Inactive */)
            : this.map(tr.changes);
    }
    map(changes) {
        return changes.empty || this.explicitPos < 0
            ? this
            : new ActiveSource(this.source, this.state, changes.mapPos(this.explicitPos));
    }
}

class ActiveResult extends ActiveSource {
    constructor(source, explicitPos, result, from, to, span) {
        super(source, 2 /* Result */, explicitPos);
        this.result = result;
        this.from = from;
        this.to = to;
        this.span = span;
    }
    hasResult() {
        return true;
    }
    handleUserEvent(tr, type, conf) {
        let from = tr.changes.mapPos(this.from),
            to = tr.changes.mapPos(this.to, 1);
        let pos = cur(tr.state);
        if ((this.explicitPos > -1 ? pos < from : pos <= from) || pos > to)
            return new ActiveSource(
                this.source,
                type == 'input' && conf.activateOnTyping ? 1 /* Pending */ : 0 /* Inactive */
            );
        let explicitPos = this.explicitPos < 0 ? -1 : tr.changes.mapPos(this.explicitPos);
        if (this.span && (from == to || this.span.test(tr.state.sliceDoc(from, to))))
            return new ActiveResult(this.source, explicitPos, this.result, from, to, this.span);
        return new ActiveSource(this.source, 1 /* Pending */, explicitPos);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(this.from, this.to)
            ? new ActiveSource(this.source, 0 /* Inactive */)
            : this.map(tr.changes);
    }
    map(mapping) {
        return mapping.empty
            ? this
            : new ActiveResult(
                  this.source,
                  this.explicitPos < 0 ? -1 : mapping.mapPos(this.explicitPos),
                  this.result,
                  mapping.mapPos(this.from),
                  mapping.mapPos(this.to, 1),
                  this.span
              );
    }
}
const startCompletionEffect = /*@__PURE__*/ StateEffect.define();
const closeCompletionEffect = /*@__PURE__*/ StateEffect.define();
const setActiveEffect = /*@__PURE__*/ StateEffect.define({
    map(sources, mapping) {
        return sources.map((s) => s.map(mapping));
    },
});
const setSelectedEffect = /*@__PURE__*/ StateEffect.define();
const completionState = /*@__PURE__*/ StateField.define({
    create() {
        return CompletionState.start();
    },
    update(value, tr) {
        return value.update(tr);
    },
    provide: (f) => [
        showTooltip.from(f, (val) => val.tooltip),
        EditorView.contentAttributes.from(f, (state) => state.attrs),
    ],
});

const CompletionInteractMargin = 75;
/**
Returns a command that moves the completion selection forward or
backward by the given amount.
*/
const moveCompletionSelection = (forward, by = 'option') => {
    return (view) => {
        let cState = view.state.field(completionState, false);
        if (
            !cState ||
            !cState.open ||
            Date.now() - cState.open.timestamp < CompletionInteractMargin
        )
            return false;
        let step = 1;
        let tooltip = view.dom.querySelector('.cm-tooltip-autocomplete');
        if (by == 'page' && tooltip)
            step = Math.max(2, Math.floor(tooltip.offsetHeight / tooltip.firstChild.offsetHeight));
        let selected = cState.open.selected + step * (forward ? 1 : -1),
            { length } = cState.open.options;
        if (selected < 0) selected = by == 'page' ? 0 : length - 1;
        else if (selected >= length) selected = by == 'page' ? length - 1 : 0;
        view.dispatch({ effects: setSelectedEffect.of(selected) });

        //handler for info dialog
        let codeDocContainerDom = tooltip.querySelector('#code-doc-container');

        const option = cState.open.options[selected];
        if (codeDocContainerDom) {
            tooltip.removeChild(codeDocContainerDom);
            codeDocContainerDom = tooltip.appendChild(document.createElement('div'));
            codeDocContainerDom.id = 'code-doc-container';
            let { info } = option.completion;
            if (info) codeDocContainerDom.appendChild(createDocContentDom(option));
        }

        return true;
    };
};

const changeCompletionSelection = () => {
    return (view) => {
        let cState = view.state.field(completionState, false);
        if (
            !cState ||
            !cState.open ||
            Date.now() - cState.open.timestamp < CompletionInteractMargin
        )
            return false;

        let tooltip = view.dom.querySelector('.cm-tooltip-autocomplete');
        if (tooltip) {
            let moreBtn = tooltip.querySelector('.cm-read-more-btn');
            moreBtn.onclick(window.event);
        }
        return true;
    };
};

/**
Accept the current completion.
*/
const acceptCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
        return false;
    applyCompletion(view, cState.open.options[cState.open.selected]);
    return true;
};
/**
Explicitly start autocompletion.
*/
const startCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState) return false;
    view.dispatch({ effects: startCompletionEffect.of(true) });
    return true;
};
/**
Close the currently active completion.
*/
const closeCompletion = (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.active.some((a) => a.state != 0 /* Inactive */)) {
        view.dispatch({ effects: closeSignatureEffect.of(null) });
        return false;
    }
    view.dispatch({ effects: closeCompletionEffect.of(null) });
    return true;
};

class RunningQuery {
    constructor(active, context) {
        this.active = active;
        this.context = context;
        this.time = Date.now();
        this.updates = [];
        // Note that 'undefined' means 'not done yet', whereas 'null' means
        // 'query returned null'.
        this.done = undefined;
    }
}

const DebounceTime = 50,
    MaxUpdateCount = 50,
    MinAbortTime = 1000;
let paramsOption = [];
function setParamOptions(data) {
    paramsOption = data;
}

const completionPlugin = /*@__PURE__*/ ViewPlugin.fromClass(
    class {
        constructor(view) {
            this.view = view;
            this.debounceUpdate = -1;
            this.running = [];
            this.debounceAccept = -1;
            this.composing = 0 /* None */;
            for (let active of view.state.field(completionState).active)
                if (active.state == 1 /* Pending */) this.startQuery(active);
        }
        update(update) {
            let cState = update.state.field(completionState);
            if (
                !update.selectionSet &&
                !update.docChanged &&
                update.startState.field(completionState) == cState
            )
                return;
            let doesReset = update.transactions.some((tr) => {
                return (tr.selection || tr.docChanged) && !getUserEvent(tr);
            });
            for (let i = 0; i < this.running.length; i++) {
                let query = this.running[i];
                if (
                    doesReset ||
                    (query.updates.length + update.transactions.length > MaxUpdateCount &&
                        query.time - Date.now() > MinAbortTime)
                ) {
                    for (let handler of query.context.abortListeners) {
                        try {
                            handler();
                        } catch (e) {
                            logException(this.view.state, e);
                        }
                    }
                    query.context.abortListeners = null;
                    this.running.splice(i--, 1);
                } else {
                    query.updates.push(...update.transactions);
                }
            }
            if (this.debounceUpdate > -1) clearTimeout(this.debounceUpdate);
            this.debounceUpdate = cState.active.some(
                (a) =>
                    a.state == 1 /* Pending */ &&
                    !this.running.some((q) => q.active.source == a.source)
            )
                ? setTimeout(() => this.startUpdate(), DebounceTime)
                : -1;
            if (this.composing != 0 /* None */)
                for (let tr of update.transactions) {
                    if (getUserEvent(tr) == 'input') this.composing = 2 /* Changed */;
                    else if (this.composing == 2 /* Changed */ && tr.selection)
                        this.composing = 3 /* ChangedAndMoved */;
                }
        }
        startUpdate() {
            this.debounceUpdate = -1;
            let { state } = this.view,
                cState = state.field(completionState);
            for (let active of cState.active) {
                if (
                    active.state == 1 /* Pending */ &&
                    !this.running.some((r) => r.active.source == active.source)
                )
                    this.startQuery(active);
            }
        }
        startQuery(active) {
            let { state } = this.view,
                pos = cur(state);
            let context = new CompletionContext(state, pos, active.explicitPos == pos);
            let pending = new RunningQuery(active, context);
            this.running.push(pending);
            Promise.resolve(active.source(context)).then(
                (result) => {
                    if (!pending.context.aborted) {
                        pending.done = result || null;
                        this.scheduleAccept();
                    }
                },
                (err) => {
                    this.view.dispatch({
                        effects: closeCompletionEffect.of(null),
                    });
                    logException(this.view.state, err);
                }
            );
        }
        scheduleAccept() {
            if (this.running.every((q) => q.done !== undefined)) this.accept();
            else if (this.debounceAccept < 0)
                this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
        }
        // For each finished query in this.running, try to create a result
        // or, if appropriate, restart the query.
        accept() {
            var _a;
            if (this.debounceAccept > -1) clearTimeout(this.debounceAccept);
            this.debounceAccept = -1;
            let updated = [];
            let conf = this.view.state.facet(completionConfig);
            for (let i = 0; i < this.running.length; i++) {
                let query = this.running[i];
                if (query.done === undefined) continue;
                this.running.splice(i--, 1);
                if (query.done) {
                    let active = new ActiveResult(
                        query.active.source,
                        query.active.explicitPos,
                        query.done,
                        query.done.from,
                        (_a = query.done.to) !== null && _a !== void 0
                            ? _a
                            : cur(
                                  query.updates.length
                                      ? query.updates[0].startState
                                      : this.view.state
                              ),
                        query.done.span && query.done.filter !== false
                            ? ensureAnchor(query.done.span, true)
                            : null
                    );
                    // Replay the transactions that happened since the start of
                    // the request and see if that preserves the result
                    for (let tr of query.updates) active = active.update(tr, conf);
                    if (active.hasResult()) {
                        updated.push(active);
                        continue;
                    }
                }
                let current = this.view.state
                    .field(completionState)
                    .active.find((a) => a.source == query.active.source);
                if (current && current.state == 1 /* Pending */) {
                    if (query.done == null) {
                        // Explicitly failed. Should clear the pending status if it
                        // hasn't been re-set in the meantime.
                        let active = new ActiveSource(query.active.source, 0 /* Inactive */);
                        for (let tr of query.updates) active = active.update(tr, conf);
                        if (active.state != 1 /* Pending */) updated.push(active);
                    } else {
                        // Cleared by subsequent transactions. Restart.
                        this.startQuery(current);
                    }
                }
            }
            if (updated.length) this.view.dispatch({ effects: setActiveEffect.of(updated) });
        }
    },
    {
        eventHandlers: {
            compositionstart() {
                this.composing = 1 /* Started */;
            },
            compositionend() {
                if (this.composing == 3 /* ChangedAndMoved */) {
                    // Safari fires compositionend events synchronously, possibly
                    // from inside an update, so dispatch asynchronously to avoid reentrancy
                    setTimeout(
                        () =>
                            this.view.dispatch({
                                effects: startCompletionEffect.of(false),
                            }),
                        20
                    );
                }
                this.composing = 0 /* None */;
            },
        },
    }
);

class FieldPos {
    constructor(field, line, from, to) {
        this.field = field;
        this.line = line;
        this.from = from;
        this.to = to;
    }
}

class FieldRange {
    constructor(field, from, to) {
        this.field = field;
        this.from = from;
        this.to = to;
    }
    map(changes) {
        return new FieldRange(
            this.field,
            changes.mapPos(this.from, -1),
            changes.mapPos(this.to, 1)
        );
    }
}

class Snippet {
    constructor(lines, fieldPositions) {
        this.lines = lines;
        this.fieldPositions = fieldPositions;
    }
    instantiate(state, pos) {
        let text = [],
            lineStart = [pos];
        let lineObj = state.doc.lineAt(pos),
            baseIndent = /^\s*/.exec(lineObj.text)[0];
        for (let line of this.lines) {
            if (text.length) {
                let indent = baseIndent,
                    tabs = /^\t*/.exec(line)[0].length;
                for (let i = 0; i < tabs; i++) indent += state.facet(indentUnit);
                lineStart.push(pos + indent.length - tabs);
                line = indent + line.slice(tabs);
            }
            text.push(line);
            pos += line.length + 1;
        }
        let ranges = this.fieldPositions.map(
            (pos) =>
                new FieldRange(
                    pos.field,
                    lineStart[pos.line] + pos.from,
                    lineStart[pos.line] + pos.to
                )
        );
        return { text, ranges };
    }

    static parse(template) {
        let fields = [];
        let lines = [],
            positions = [],
            m;
        for (let line of template.split(/\r\n?|\n/)) {
            while ((m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line))) {
                let seq = m[1] ? +m[1] : null,
                    name = m[2] || m[3],
                    found = -1;
                for (let i = 0; i < fields.length; i++) {
                    if (seq != null ? fields[i].seq == seq : name ? fields[i].name == name : false)
                        found = i;
                }
                if (found < 0) {
                    let i = 0;
                    while (
                        i < fields.length &&
                        (seq == null || (fields[i].seq != null && fields[i].seq < seq))
                    )
                        i++;
                    fields.splice(i, 0, { seq, name: name || null });
                    found = i;
                    for (let pos of positions) if (pos.field >= found) pos.field++;
                }
                positions.push(new FieldPos(found, lines.length, m.index, m.index + name.length));
                line = line.slice(0, m.index) + name + line.slice(m.index + m[0].length);
            }
            lines.push(line);
        }
        return new Snippet(lines, positions);
    }
}

let fieldMarker = /*@__PURE__*/ Decoration.widget({
    widget: /*@__PURE__*/ new (class extends WidgetType {
        toDOM() {
            let span = document.createElement('span');
            span.className = 'cm-snippetFieldPosition';
            return span;
        }
        ignoreEvent() {
            return false;
        }
    })(),
});

let fieldRange = /*@__PURE__*/ Decoration.mark({ class: 'cm-snippetField' });
class ActiveSnippet {
    constructor(ranges, active) {
        this.ranges = ranges;
        this.active = active;
        this.deco = Decoration.set(
            ranges.map((r) => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to))
        );
    }
    map(changes) {
        return new ActiveSnippet(
            this.ranges.map((r) => r.map(changes)),
            this.active
        );
    }
    selectionInsideField(sel) {
        return sel.ranges.every((range) =>
            this.ranges.some(
                (r) => r.field == this.active && r.from <= range.from && r.to >= range.to
            )
        );
    }
}

const setActive = /*@__PURE__*/ StateEffect.define({
    map(value, changes) {
        return value && value.map(changes);
    },
});

const moveToField = /*@__PURE__*/ StateEffect.define();
const snippetState = /*@__PURE__*/ StateField.define({
    create() {
        return null;
    },
    update(value, tr) {
        for (let effect of tr.effects) {
            if (effect.is(setActive)) return effect.value;
            if (effect.is(moveToField) && value)
                return new ActiveSnippet(value.ranges, effect.value);
        }
        if (value && tr.docChanged) value = value.map(tr.changes);
        if (value && tr.selection && !value.selectionInsideField(tr.selection)) value = null;
        return value;
    },
    provide: (f) => EditorView.decorations.from(f, (val) => (val ? val.deco : Decoration.none)),
});

function fieldSelection(ranges, field) {
    return EditorSelection.create(
        ranges.filter((r) => r.field == field).map((r) => EditorSelection.range(r.from, r.to))
    );
}
/**
Convert a snippet template to a function that can apply it.
Snippets are written using syntax like this:

    "for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"

Each `${}` placeholder (you may also use `#{}`) indicates a field
that the user can fill in. Its name, if any, will be the default
content for the field.

When the snippet is activated by calling the returned function,
the code is inserted at the given position. Newlines in the
template are indented by the indentation of the start line, plus
one [indent unit](https://codemirror.net/6/docs/ref/#language.indentUnit) per tab character after
the newline.

On activation, (all instances of) the first field are selected.
The user can move between fields with Tab and Shift-Tab as long as
the fields are active. Moving to the last field or moving the
cursor out of the current field deactivates the fields.

The order of fields defaults to textual order, but you can add
numbers to placeholders (`${1}` or `${1:defaultText}`) to provide
a custom order.
*/
function snippet(template) {
    let snippet = Snippet.parse(template);
    return (editor, _completion, from, to) => {
        let { text, ranges } = snippet.instantiate(editor.state, from);
        let spec = { changes: { from, to, insert: Text.of(text) } };
        if (ranges.length) spec.selection = fieldSelection(ranges, 0);
        if (ranges.length > 1) {
            let active = new ActiveSnippet(ranges, 0);
            let effects = (spec.effects = [setActive.of(active)]);
            if (editor.state.field(snippetState, false) === undefined)
                effects.push(
                    StateEffect.appendConfig.of([
                        snippetState.init(() => active),
                        addSnippetKeymap,
                        snippetPointerHandler,
                    ])
                );
        }
        editor.dispatch(editor.state.update(spec));
    };
}

function moveField(dir) {
    return ({ state, dispatch }) => {
        let active = state.field(snippetState, false);
        if (!active || (dir < 0 && active.active == 0)) return false;
        let next = active.active + dir,
            last = dir > 0 && !active.ranges.some((r) => r.field == next + dir);
        dispatch(
            state.update({
                selection: fieldSelection(active.ranges, next),
                effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next)),
            })
        );
        return true;
    };
}
/**
A command that clears the active snippet, if any.
*/
const clearSnippet = ({ state, dispatch }) => {
    let active = state.field(snippetState, false);
    if (!active) return false;
    dispatch(state.update({ effects: setActive.of(null) }));
    return true;
};
/**
Move to the next snippet field, if available.
*/
const nextSnippetField = /*@__PURE__*/ moveField(1);
/**
Move to the previous snippet field, if available.
*/
const prevSnippetField = /*@__PURE__*/ moveField(-1);
const defaultSnippetKeymap = [
    { key: 'Tab', run: nextSnippetField, shift: prevSnippetField },
    { key: 'Escape', run: clearSnippet },
];
/**
A facet that can be used to configure the key bindings used by
snippets. The default binds Tab to
[`nextSnippetField`](https://codemirror.net/6/docs/ref/#autocomplete.nextSnippetField), Shift-Tab to
[`prevSnippetField`](https://codemirror.net/6/docs/ref/#autocomplete.prevSnippetField), and Escape
to [`clearSnippet`](https://codemirror.net/6/docs/ref/#autocomplete.clearSnippet).
*/
const snippetKeymap = /*@__PURE__*/ Facet.define({
    combine(maps) {
        return maps.length ? maps[0] : defaultSnippetKeymap;
    },
});
const addSnippetKeymap = /*@__PURE__*/ Prec.override(
    /*@__PURE__*/ keymap.compute([snippetKeymap], (state) => state.facet(snippetKeymap))
);
/**
Create a completion from a snippet. Returns an object with the
properties from `completion`, plus an `apply` function that
applies the snippet.
*/
function snippetCompletion(template, completion) {
    return Object.assign(Object.assign({}, completion), {
        apply: snippet(template),
    });
}

const snippetPointerHandler = /*@__PURE__*/ EditorView.domEventHandlers({
    mousedown(event, view) {
        let active = view.state.field(snippetState, false),
            pos;
        if (!active || (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) == null)
            return false;
        let match = active.ranges.find((r) => r.from <= pos && r.to >= pos);
        if (!match || match.field == active.active) return false;
        view.dispatch({
            selection: fieldSelection(active.ranges, match.field),
            effects: setActive.of(
                active.ranges.some((r) => r.field > match.field)
                    ? new ActiveSnippet(active.ranges, match.field)
                    : null
            ),
        });
        return true;
    },
});

function wordRE(wordChars) {
    let escaped = wordChars.replace(/[\\[.+*?(){|^$]/g, '\\$&');
    try {
        return new RegExp(`[\\p{Alphabetic}\\p{Number}_${escaped}]+`, 'ug');
    } catch (_a) {
        return new RegExp(`[\w${escaped}]`, 'g');
    }
}

function mapRE(re, f) {
    return new RegExp(f(re.source), re.unicode ? 'u' : '');
}

const wordCaches = /*@__PURE__*/ Object.create(null);
function wordCache(wordChars) {
    return wordCaches[wordChars] || (wordCaches[wordChars] = new WeakMap());
}

function storeWords(doc, wordRE, result, seen, ignoreAt) {
    for (let lines = doc.iterLines(), pos = 0; !lines.next().done; ) {
        let { value } = lines,
            m;
        wordRE.lastIndex = 0;
        while ((m = wordRE.exec(value))) {
            if (!seen[m[0]] && pos + m.index != ignoreAt) {
                result.push({ type: 'text', label: m[0] });
                seen[m[0]] = true;
                if (result.length >= 2000 /* MaxList */) return;
            }
        }
        pos += value.length + 1;
    }
}

function collectWords(doc, cache, wordRE, to, ignoreAt) {
    let big = doc.length >= 1000; /* MinCacheLen */
    let cached = big && cache.get(doc);
    if (cached) return cached;
    let result = [],
        seen = Object.create(null);
    if (doc.children) {
        let pos = 0;
        for (let ch of doc.children) {
            if (ch.length >= 1000 /* MinCacheLen */) {
                for (let c of collectWords(ch, cache, wordRE, to - pos, ignoreAt - pos)) {
                    if (!seen[c.label]) {
                        seen[c.label] = true;
                        result.push(c);
                    }
                }
            } else {
                storeWords(ch, wordRE, result, seen, ignoreAt - pos);
            }
            pos += ch.length + 1;
        }
    } else {
        storeWords(doc, wordRE, result, seen, ignoreAt);
    }
    if (big && result.length < 2000 /* MaxList */) cache.set(doc, result);
    return result;
}
/**
A completion source that will scan the document for words (using a
[character categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer)), and
return those as completions.
*/
const completeAnyWord = (context) => {
    let wordChars = context.state.languageDataAt('wordChars', context.pos).join('');
    let re = wordRE(wordChars);
    let token = context.matchBefore(mapRE(re, (s) => s + '$'));
    if (!token && !context.explicit) return null;
    let from = token ? token.from : context.pos;
    let options = collectWords(
        context.state.doc,
        wordCache(wordChars),
        re,
        50000 /* Range */,
        from
    );
    return { from, options, span: mapRE(re, (s) => '^' + s) };
};

/**
Returns an extension that enables autocompletion.
*/
function autocompletion(config = {}) {
    return [completionState, completionConfig.of(config), completionPlugin, completionKeymapExt];
}
/**
Basic keybindings for autocompletion.

 - Ctrl-Space: [`startCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.startCompletion)
 - Escape: [`closeCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.closeCompletion)
 - ArrowDown: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(true)`
 - ArrowUp: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(false)`
 - PageDown: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(true, "page")`
 - PageDown: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(true, "page")`
 - Enter: [`acceptCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.acceptCompletion)
*/
const completionKeymap = [
    { key: 'Ctrl-Space', run: startCompletion },
    { key: 'Escape', run: closeCompletion },
    { key: 'ArrowDown', run: /*@__PURE__*/ moveCompletionSelection(true) },
    { key: 'ArrowUp', run: /*@__PURE__*/ moveCompletionSelection(false) },
    { key: 'ArrowRight', run: /*@__PURE__*/ changeCompletionSelection(true) },
    { key: 'ArrowLeft', run: /*@__PURE__*/ changeCompletionSelection(false) },
    { key: 'PageDown', run: /*@__PURE__*/ moveCompletionSelection(true, 'page') },
    { key: 'PageUp', run: /*@__PURE__*/ moveCompletionSelection(false, 'page') },
    { key: 'Enter', run: acceptCompletion },
];

const completionKeymapExt = /*@__PURE__*/ Prec.override(
    /*@__PURE__*/ keymap.computeN([completionConfig], (state) =>
        state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []
    )
);
/**
Get the current completion status. When completions are available,
this will return `"active"`. When completions are pending (in the
process of being queried), this returns `"pending"`. Otherwise, it
returns `null`.
*/
function completionStatus(state) {
    let cState = state.field(completionState, false);
    return cState && cState.active.some((a) => a.state == 1 /* Pending */)
        ? 'pending'
        : cState && cState.active.some((a) => a.state != 0 /* Inactive */)
        ? 'active'
        : null;
}
/**
Returns the available completions as an array.
*/
function currentCompletions(state) {
    var _a;
    let open =
        (_a = state.field(completionState, false)) === null || _a === void 0 ? void 0 : _a.open;
    return open ? open.options.map((o) => o.completion) : [];
}

export {
    CompletionContext,
    acceptCompletion,
    autocompletion,
    clearSnippet,
    closeCompletion,
    completeAnyWord,
    completeFromList,
    startCompletion,
    completionKeymap,
    completionStatus,
    currentCompletions,
    ifIn,
    ifNotIn,
    moveCompletionSelection,
    nextSnippetField,
    prevSnippetField,
    snippet,
    snippetCompletion,
    snippetKeymap,
    setParamOptions,
};
