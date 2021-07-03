import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
//  set the highlight
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
//
import {
  jsx,
  javascript,
  typescript,
  css,
  json,
  cpp,
} from "react-syntax-highlighter/dist/esm/languages/prism";

class CodeBlock extends PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired,
    language: PropTypes.string,
  };

  static defaultProps = {
    language: null,
  };

  componentWillMount() {
    //
    //
    SyntaxHighlighter.registerLanguage("jsx", jsx);
    SyntaxHighlighter.registerLanguage("json", json);
    SyntaxHighlighter.registerLanguage("javascript", javascript);
    SyntaxHighlighter.registerLanguage("typescript", typescript);
    SyntaxHighlighter.registerLanguage("css", css);
    SyntaxHighlighter.registerLanguage("cpp", cpp);
  }

  render() {
    const { language, value } = this.props;
    return (
      <figure className="highlight">
        <SyntaxHighlighter 
          language={language}
          style={coy}
          lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
          wrapLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </figure>
    );
  }
}

export default CodeBlock;
