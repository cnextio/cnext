import React, { useEffect, useState } from "react";
import MonacoEditor from '@monaco-editor/react';
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
// @ts-ignore
import { MonacoBinding } from '../../../y-monaco';
// import * as monaco from 'monaco-editor';

const CodeEditor = ({ stopMouseEvent, ydoc, project, provider, remoteProject }) => {
  const path = useSelector((state: RootState) => state.projectManager.inViewID);
  const [monaco, setMonaco] = useState(null);
  const [editor, setEditor] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  // const [remoteCursorManager, setRemoteCursorManager] = useState<MonacoCollabExt.RemoteCursorManager>(null);
  const [binding, setBinding] = useState<any>(null);

  // When path changes, update the editor
  useEffect(() => {
    if (!isEditorReady) {
      return;
    }

    if (binding) {
      binding.destroy();
    }

    const file = project.get(path);

    if (file) {
      const source = file.get('source');
      const modelUri = monaco.Uri.parse(path);
      const model = editor.getModel(modelUri);

      setBinding(new MonacoBinding(source, model, new Set([editor]), provider.awareness, null));
    }
  }, [path, isEditorReady]);

  // TODO(huytq): type check
  function handleEditorWillMount(monaco: any) {
    setMonaco(monaco);
  }

  // TODO(huytq): type check
  function handleEditorDidMount(editor: any, monaco: any) {
    setMonaco(monaco);
    setEditor(editor);
    setIsEditorReady(true);
    // const remoteCursorManager = new MonacoCollabExt.RemoteCursorManager({
    //   editor: editor,
    //   tooltips: true,
    //   tooltipDuration: 2
    // });
    // setRemoteCursorManager(remoteCursorManager);
  }

  return (
    <MonacoEditor
      height="100vh"
      path={path}
      defaultValue=""
      defaultLanguage="python"
      options={{
        minimap: { enabled: true, autohide: true },
        fontSize: 12,
        renderLineHighlight: "none",
        scrollbar: { verticalScrollbarSize: 10 },
        readOnly: !!remoteProject,
        // foldingStrategy: "indentation",
      }}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorWillMount}
    />
  );
};

export default CodeEditor;
