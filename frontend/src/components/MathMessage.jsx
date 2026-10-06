import React, { useMemo } from 'react';
import katex from 'katex';
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true
});

function renderMathInText(text) {
  if (!text || typeof text !== 'string') return '';

  // 1. Process display math blocks: $$ ... $$ and \[ ... \]
  let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false
      });
      return `<div class="math-block-display">${rendered}</div>`;
    } catch {
      return `<pre class="math-fallback">${math}</pre>`;
    }
  });

  processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false
      });
      return `<div class="math-block-display">${rendered}</div>`;
    } catch {
      return `<pre class="math-fallback">${math}</pre>`;
    }
  });

  // 2. Process inline math: $ ... $ and \( ... \)
  // Match single $ that are not part of $$ or followed/preceded by another $
  processed = processed.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false
      });
    } catch {
      return `<code>${math}</code>`;
    }
  });

  processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false
      });
    } catch {
      return `<code>${math}</code>`;
    }
  });

  return processed;
}

export default function MathMessage({ content, isUser = false }) {
  const htmlContent = useMemo(() => {
    if (!content) return '';

    if (isUser) {
      // User message: quick inline math & markdown
      const mathified = renderMathInText(content);
      return marked.parse(mathified);
    }

    // Assistant message: full rich markdown & math
    const mathified = renderMathInText(content);
    let parsed = marked.parse(mathified);

    // Enhance Final Answer sections
    parsed = parsed.replace(
      /<h3[^>]*>(?:<strong[^>]*>)?(?:Final Answer:?|Answer:?)(?:<\/strong>)?<\/h3>([\s\S]*?)(?=<h[1-6]|<hr|$)/gi,
      (_, body) => `
        <div class="solution-highlight-card">
          <div class="solution-badge">
            <span class="solution-icon">✓</span>
            <span>Final Answer</span>
          </div>
          <div class="solution-body">${body}</div>
        </div>
      `
    );

    // Enhance Tips / Pro-tips
    parsed = parsed.replace(
      /<p>(?:<strong[^>]*>)?(?:Tip|Tip to remember|Remember|Note):?(?:<\/strong>)?([\s\S]*?)<\/p>/gi,
      (_, tipText) => `
        <div class="tip-callout-card">
          <span class="tip-icon">💡</span>
          <div><strong>Tip:</strong> ${tipText}</div>
        </div>
      `
    );

    return parsed;
  }, [content, isUser]);

  return (
    <div
      className={`tutormind-chat-message mathlingo-chat-message ${isUser ? 'user-msg' : 'bot-msg'}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
