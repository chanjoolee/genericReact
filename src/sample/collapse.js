import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  jsx,
  javascript,
} from "react-syntax-highlighter/dist/esm/languages/prism";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("javascript", javascript);

function Collapse() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "코드보기" : "코드숨기기"}
      </button>
      <div style={{ display: `${collapsed ? "none" : "block"}` }}>
        <SyntaxHighlighter
          language="jsx"
          style={darcula}
          showLineNumbers={!collapsed}
          startingLineNumber={1}
          lineNumberStyle={{ minWidth: "2em" }}
          wrapLines={true}
        >
          {`function add(a, b) {
  return a + b;
}`}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default Collapse;
