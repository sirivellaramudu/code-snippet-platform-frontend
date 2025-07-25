import React from 'react';

const STARTER_CODE = {
  python3: 'print("Hello, World!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
};

export default function LanguageSelector({ language, setLanguage, onRun }) {
  return (
    <div style={{ display: 'flex', marginBottom: 18, gap: 16 }}>
      <select
        value={language}
        onChange={e => {
          setLanguage(e.target.value);
        }}
        style={{ flex: 1, padding: '8px 12px', fontSize: 15, borderRadius: 6, border: '1px solid #e0e0e0', background: '#f9fbfc', color: '#333' }}
      >
        <option value="python3">Python 3</option>
        <option value="java">Java</option>
        <option value="c">C</option>
        <option value="cpp">C++</option>
      </select>
      <button onClick={onRun} style={{ background: 'linear-gradient(90deg,#0a66c2 0%,#4f8cff 100%)', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 6px #0a66c222' }}>Run Code</button>
    </div>
  );
}
