import {ExternalTokenizer, ContextTracker} from "@lezer/lr"
import {
  newline as newlineToken, eof, newlineEmpty, newlineBracketed, indent, dedent, printKeyword,
  ParenthesizedExpression, TupleExpression, ComprehensionExpression,
  ArrayExpression, ArrayComprehensionExpression, ArgList, ParamList, importList, subscript,
  DictionaryExpression, DictionaryComprehensionExpression, SetExpression, SetComprehensionExpression, FormatReplacement,
  ParenL, BraceL, BracketL
} from "./cnext-python.terms.js"

const newline = 10, carriageReturn = 13, space = 32, tab = 9, hash = 35, parenOpen = 40, dot = 46

const bracketed = [
  ParenthesizedExpression, TupleExpression, ComprehensionExpression, importList, ArgList, ParamList,
  ArrayExpression, ArrayComprehensionExpression, subscript,
  SetExpression, SetComprehensionExpression,
  DictionaryExpression, DictionaryComprehensionExpression, FormatReplacement
]

export const newlines = new ExternalTokenizer((input, stack) => {
  if (input.next < 0) {
    input.acceptToken(eof)
  } else if (input.next != newline && input.next != carriageReturn) {
  } else if (stack.context.depth < 0) {
    input.acceptToken(newlineBracketed, 1)
  } else {
    input.advance()
    let spaces = 0
    while (input.next == space || input.next == tab) { input.advance(); spaces++ }
    let empty = input.next == newline || input.next == carriageReturn || input.next == hash
    input.acceptToken(empty ? newlineEmpty : newlineToken, -spaces)
  }
}, {contextual: true, fallback: true})

export const indentation = new ExternalTokenizer((input, stack) => {
  let cDepth = stack.context.depth
  if (cDepth < 0) return
  let prev = input.peek(-1), depth
  if ((prev == newline || prev == carriageReturn) && stack.context.depth >= 0) {
    let depth = 0, chars = 0
    for (;;) {
      if (input.next == space) depth++
      else if (input.next == tab) depth += 8 - (depth % 8)
      else break
      input.advance()
      chars++
    }
    if (depth != cDepth &&
        input.next != newline && input.next != carriageReturn && input.next != hash) {
      if (depth < cDepth) input.acceptToken(dedent, -chars)
      else input.acceptToken(indent)
    }
  }
})

function IndentLevel(parent, depth) {
  this.parent = parent
  // -1 means this is not an actual indent level but a set of brackets
  this.depth = depth
  this.hash = (parent ? parent.hash + parent.hash << 8 : 0) + depth + (depth << 4)
}

const topIndent = new IndentLevel(null, 0)

export const trackIndent = new ContextTracker({
  start: topIndent,
  reduce(context, term) {
    return context.depth < 0 && bracketed.indexOf(term) > -1 ? context.parent : context
  },
  shift(context, term, stack, input) {
    if (term == indent) return new IndentLevel(context, stack.pos - input.pos)
    if (term == dedent) return context.parent
    if (term == ParenL || term == BracketL || term == BraceL) return new IndentLevel(context, -1)
    return context
  },
  hash(context) { return context.hash }
})

export const legacyPrint = new ExternalTokenizer(input => {
  for (let i = 0; i < 5; i++) {
    if (input.next != "print".charCodeAt(i)) return
    input.advance()
  }
  if (/\w/.test(String.fromCharCode(input.next))) return
  for (let off = 0;; off++) {
    let next = input.peek(off)
    if (next == space || next == tab) continue
    if (next != parenOpen && next != dot && next != newline && next != carriageReturn && next != hash)
      input.acceptToken(printKeyword)
    return
  }
})
