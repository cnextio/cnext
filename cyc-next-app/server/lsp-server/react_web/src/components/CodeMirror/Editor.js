import React from 'react';
import { EditorState, EditorStateConfig } from '@codemirror/state';
import { EditorView } from '@codemirror/basic-setup';
import { extensions } from './extensions';

function setRefs(ref, value) {
  if(typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

function useMergedRefs(forwardedRef, localRef) {
  return React.useCallback((value) => 
  {
    setRefs(forwardedRef, value)
    setRefs(localRef, value)
  },
  [forwardedRef, localRef]
  )
}

const CodeMirror = React.forwardRef(
  (
    {
      value,
      value2,
      selection,
      onEditorViewChange,
      onEditorStateChange,
      onUpdate,
      elementProps
    },
    ref
  ) => {
    const innerRef = React.useRef(null)
    const mergedRef = useMergedRefs(ref, innerRef)

    const [editorView, setEditorView] = React.useState(null)

    React.useEffect(() => {
      const currentEditor = innerRef.current
      if (!currentEditor) return

      const view = new EditorView({parent: currentEditor})
      setEditorView(view)
      if (onEditorViewChange) onEditorViewChange(view)
      return () => view.destroy()
    }, [innerRef])
    
    React.useEffect(() => {
      if (!editorView) return
      if (onUpdate) extensions.push(EditorView.updateListener.of(onUpdate))

      //keep current state, only change extensions
      const editorState = EditorState.create({
        doc: editorView.state.doc.toString(),
        selection: editorView.state.selection,
        extensions,
      })
      editorView.setState(editorState)
      if (onEditorStateChange) onEditorStateChange(editorState)
    },[editorView])

    React.useEffect(() => {
      if (!editorView) return

      const transaction = editorView.state.update({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: value2,
        },
      })

      editorView.dispatch(transaction)
    },[value2, editorView])

    React.useEffect(() => {
      if (!editorView) return
      const transaction = editorView.state.update({
        selection,
      })

      editorView.dispatch(transaction)
    }, [selection, editorView])
    
    return <div ref={mergedRef} {...elementProps} />
  }
)

// https://github.com/sachinraja/rodemirror/blob/main/src/index.tsx

CodeMirror.displayName = 'CodeMirror'

export default CodeMirror;
