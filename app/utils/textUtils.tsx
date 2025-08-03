import React from 'react';

/**
 * テキスト処理のユーティリティ関数
 */

/**
 * テキスト内のURLを検出する正規表現
 */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * テキストを処理してJSX要素に変換する
 * - 改行を<br>タグに変換
 * - URLをリンクに変換
 */
export const formatTextWithLinksAndBreaks = (text: string, isDarkMode: boolean = false): React.ReactElement[] => {
  if (!text) return [];

  // 改行で分割
  const lines = text.split('\n');
  
  const elements: React.ReactElement[] = [];
  
  lines.forEach((line: string, lineIndex: number) => {
    if (line.trim() === '') {
      // 空行の場合は改行のみ追加
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }

    // URLを検出して分割
    const parts = line.split(URL_REGEX);
    const lineElements: (string | React.ReactElement)[] = [];
    
    parts.forEach((part: string, partIndex: number) => {
      if (URL_REGEX.test(part)) {
        // URLの場合はリンクとして処理
        lineElements.push(
          <a
            key={`link-${lineIndex}-${partIndex}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline break-all ${
              isDarkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {part}
          </a>
        );
      } else if (part) {
        // 通常のテキスト
        lineElements.push(part);
      }
    });
    
    // 行の要素をspanでラップ
    elements.push(
      <span key={`line-${lineIndex}`}>
        {lineElements}
      </span>
    );
    
    // 最後の行でなければ改行を追加
    if (lineIndex < lines.length - 1) {
      elements.push(<br key={`br-after-${lineIndex}`} />);
    }
  });
  
  return elements;
};

/**
 * プレーンテキストからHTMLを生成（dangerouslySetInnerHTMLを使わない安全な方法）
 */
export const renderFormattedText = (text: string, isDarkMode: boolean = false): React.ReactElement => {
  const formattedElements = formatTextWithLinksAndBreaks(text, isDarkMode);
  return <>{formattedElements}</>;
};
