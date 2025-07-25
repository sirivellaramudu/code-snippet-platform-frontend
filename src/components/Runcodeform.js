import React, { useState } from 'react';

export default function RunCodeForm() {
  const [code, setCode] = useState("print('Hello from JDoodle!')");
  const [output, setOutput] = useState("");

  const runCode = async () => {
    const response = await fetch('http://localhost:4000/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: code,
        language: 'python3',
      }),
    });

    const result = await response.json();
    setOutput(result.output || result.error);
  };

  return (
    <div>
      <textarea
        rows="6"
        cols="60"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br />
      <button onClick={runCode}>Run Code</button>
      <pre>{output}</pre>
    </div>
  );
}
