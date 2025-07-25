import React from 'react';

function Output({ output }) {
  return (
    <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap' }}>
      <h4>Output:</h4>
      <div>{output}</div>
    </div>
  );
}

export default Output;
