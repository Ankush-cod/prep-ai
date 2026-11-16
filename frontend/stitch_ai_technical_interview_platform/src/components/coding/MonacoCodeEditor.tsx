// src/components/coding/MonacoCodeEditor.tsx
import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monacoType from 'monaco-editor';

export interface MonacoCodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'vs-dark';
  fontSize?: number;
  wordWrap?: boolean;
  minimap?: boolean;
  height?: string;
  readOnly?: boolean;
}

const MONACO_LANG_MAP: Record<string, string> = {
  cpp: 'cpp',
  cpp20: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  c: 'c',
  go: 'go',
};

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  language,
  value,
  onChange,
  theme = 'light',
  fontSize = 14,
  wordWrap = false,
  minimap = false,
  height = '480px',
  readOnly = false,
}) => {
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Explicitly enforce 4 spaces tab indentation
    editor.getModel()?.updateOptions({
      tabSize: 4,
      insertSpaces: true,
    });

    // Ensure tab key inserts 4 spaces and NEVER leaves the editor or focuses other DOM nodes
    editor.addCommand(monaco.KeyCode.Tab, () => {
      editor.trigger('keyboard', 'type', { text: '    ' });
    });

    // Stop propagation of Tab so browser / parent form elements don't shift focus
    editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Tab) {
        e.stopPropagation();
      }
    });

    // Ensure automatic layout updates
    editor.layout();
  };

  const monacoLanguage = MONACO_LANG_MAP[language.toLowerCase()] || 'plaintext';
  const monacoTheme = theme === 'vs-dark' ? 'vs-dark' : 'vs';

  return (
    <div className="relative w-full overflow-hidden border border-[#E2E4EB] rounded-xl bg-white" style={{ height }}>
      <Editor
        height={height}
        language={monacoLanguage}
        value={value}
        theme={monacoTheme}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorMount}
        options={{
          fontSize,
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', monospace",
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          tabSize: 4,
          insertSpaces: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          bracketPairColorization: { enabled: true },
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'always',
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          wordWrap: wordWrap ? 'on' : 'off',
          minimap: { enabled: minimap },
          renderWhitespace: 'none',
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
        }}
      />
    </div>
  );
};
