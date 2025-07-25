import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const MONACO_LANGUAGE = {
  python3: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
};

function CodeEditor({ code, setCode, language, remoteCursors = [], onCursorChange }) {
  const editorRef = useRef(null);
  const decorationIds = useRef([]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition(e => {
      if (onCursorChange) {
        onCursorChange(e.position);
      }
    });
  }

  // Apply remote cursors as Monaco decorations
  useEffect(() => {
    if (!editorRef.current) return;
    // Remove previous decorations
    decorationIds.current = editorRef.current.deltaDecorations(
      decorationIds.current,
      remoteCursors.map(cur => ({
        range: new window.monaco.Range(
          cur.position.lineNumber,
          cur.position.column,
          cur.position.lineNumber,
          cur.position.column
        ),
        options: {
          className: '',
          stickiness: 1,
          afterContentClassName: '',
          glyphMarginClassName: '',
          isWholeLine: false,
          inlineClassName: '',
          overviewRuler: {
            color: cur.color,
            position: 4,
          },
          beforeContentClassName: '',
          after: {
            content: ` ${cur.label}`,
            inlineClassName: '',
          },
          before: {
            content: '',
          },
          // Render a colored vertical bar as cursor
          inlineClassName: '',
          className: '',
          // Use a border to simulate a cursor
          border: `2px solid ${cur.color}`,
          borderColor: cur.color,
          borderStyle: 'solid',
          borderWidth: '2px 0 2px 0',
        },
      }))
    );
    // Cleanup on unmount
    return () => {
      if (editorRef.current) {
        decorationIds.current = editorRef.current.deltaDecorations(decorationIds.current, []);
      }
    };
  }, [remoteCursors]);

  return (
    <Editor
      height="60vh"
      language={MONACO_LANGUAGE[language] || 'plaintext'}
      value={code}
      onChange={value => setCode(value)}
      theme="vs-dark"
      options={{
        fontSize: 15,
        minimap: { enabled: false },
        formatOnPaste: true,
        formatOnType: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        roundedSelection: false,
        automaticLayout: true,
      }}
      onMount={handleEditorDidMount}
    />
  );
}


export default CodeEditor;
