/**
 * 日付文字列を日本語フォーマットで表示用に変換します
 * @param dateString - YYYY-MM-DD形式の日付文字列
 * @returns 「2024年1月15日(月)」形式の文字列、空文字の場合は空文字を返す
 * @example
 * formatDate('2024-01-15') // → "2024年1月15日 月"
 * formatDate('') // → ""
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  });
};

/**
 * 日付文字列を短い日本語フォーマットで表示用に変換します
 * @param dateString - YYYY-MM-DD形式の日付文字列
 * @returns 「1月15日 月」形式の文字列、空文字の場合は空文字を返す
 * @example
 * formatDateShort('2024-01-15') // → "1月15日 月"
 * formatDateShort('') // → ""
 */
export const formatDateShort = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  });
};

/**
 * 今日の日付をYYYY-MM-DD形式で取得します
 * @returns YYYY-MM-DD形式の今日の日付文字列
 * @example
 * getTodayDate() // → "2024-01-15"
 */
export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * DateオブジェクトをICSファイル用の日時フォーマットに変換します
 * @param date - 変換するDateオブジェクト
 * @returns YYYYMMDDTHHMMSSZ形式の文字列
 * @example
 * formatIcsDate(new Date('2024-01-15T10:30:00')) // → "20240115T103000Z"
 */
export const formatIcsDate = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};