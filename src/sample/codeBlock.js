import SyntaxHighlighter from "react-syntax-highlighter";
import {
  docco,
  dracula,
  github,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import ReactMarkdown from "react-markdown";

function CodeBlock() {
  const xmlCode = `
  <?xml version="1.0" encoding="UTF-8"?>
  <catalog>
    <book id="bk101">
      <author>Gambardella, Matthew</author>
      <title>XML Developer's Guide</title>
      <genre>Computer</genre>
      <price>44.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>An in-depth look at creating applications 
      with XML.</description>
    </book>
    <book id="bk102">
      <author>Ralls, Kim</author>
      <title>Midnight Rain</title>
      <genre>Fantasy</genre>
      <price>5.95</price>
      <publish_date>2000-12-16</publish_date>
      <description>A former architect battles corporate zombies, 
      an evil sorceress, and her own childhood to become queen 
      of the world.</description>
    </book>
  </catalog>
  `;

  return (
    <>
      <SyntaxHighlighter language="text" style={github}>
        {`
        안녕하세요
        아래의 문장에 대해 설명해 드리겠습니다.
        일단 아래의 명령으로 라이브러리를 설치하세요.
          npm install react-syntax-highlighter
        `}
      </SyntaxHighlighter>
      <SyntaxHighlighter language="javascript" style={dracula}>
        {`
          function greet(name) {
            console.log("Hello, " + name + "!");
          }
        `}
      </SyntaxHighlighter>
      <SyntaxHighlighter language="xml" style={dracula}>
        {xmlCode}
      </SyntaxHighlighter>

      <SyntaxHighlighter language="html" style={github}>
        {'<a href="https://www.example.com">Example Link</a>'}
      </SyntaxHighlighter>
      <SyntaxHighlighter language="markdown" style={dracula}>
        {"[Example Link](https://www.example.com)"}
      </SyntaxHighlighter>
    </>
  );
}

export default CodeBlock;
