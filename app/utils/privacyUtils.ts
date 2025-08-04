/**
 * プライバシーモード用のユーティリティ関数
 */

/**
 * 利用可能な背景色の配列
 */
const PRIVACY_COLORS = [
  'bg-blue-500',    // 青
  'bg-green-500',   // 緑
  'bg-purple-500',  // 紫
  'bg-red-500',     // 赤
  'bg-orange-500',  // オレンジ
  'bg-teal-500',    // ティール
  'bg-pink-500',    // ピンク
  'bg-indigo-500',  // インディゴ
  'bg-yellow-500',  // 黄色
  'bg-cyan-500',    // シアン
];

/**
 * meeting IDから一貫した識別子を生成します
 * @param meetingId 面談のID
 * @param allMeetingIds 全ての面談IDの配列（ソート済み）
 * @returns 識別子文字列（"A さん", "B さん"など）
 */
export const getPrivacyIdentifier = (meetingId: number, allMeetingIds: number[]): string => {
  const sortedIds = [...allMeetingIds].sort((a, b) => a - b);
  const index = sortedIds.indexOf(meetingId);
  
  if (index === -1) return '? さん';
  
  // A, B, C, ... Z, AA, BB, CC...
  const letter = String.fromCharCode(65 + (index % 26)); // A=65
  const repeat = Math.floor(index / 26) + 1;
  
  return `${letter.repeat(repeat)} さん`;
};

/**
 * meeting IDから一貫した背景色クラスを生成します
 * @param meetingId 面談のID
 * @param allMeetingIds 全ての面談IDの配列（ソート済み）
 * @returns Tailwind CSSの背景色クラス
 */
export const getPrivacyColor = (meetingId: number, allMeetingIds: number[]): string => {
  const sortedIds = [...allMeetingIds].sort((a, b) => a - b);
  const index = sortedIds.indexOf(meetingId);
  
  if (index === -1) return 'bg-gray-500';
  
  const colorIndex = index % PRIVACY_COLORS.length;
  return PRIVACY_COLORS[colorIndex];
};

/**
 * スケジュール情報から面談IDを取得します
 * @param scheduleSummary スケジュールサマリー
 * @param meetingName 面談者名
 * @returns 面談ID（見つからない場合は0）
 */
export const getMeetingIdFromSchedule = (meetings: any[], meetingName: string): number => {
  const meeting = meetings.find(m => m.name === meetingName);
  return meeting?.id || 0;
};