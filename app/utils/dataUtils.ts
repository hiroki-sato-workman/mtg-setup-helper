import type { Meeting } from '~/types/meeting';

/**
 * 開発モードかどうかを判定します
 * @returns 開発モードの場合はtrue
 */
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV;
};

/**
 * 面談データをJSONファイルとしてエクスポートします
 * @param meetings 面談データの配列
 */
export const exportMeetingData = (meetings: Meeting[]): void => {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    meetings: meetings
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `meeting-data-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * JSONファイルから面談データをインポートします
 * @param file インポートするJSONファイル
 * @returns Promise<Meeting[]> インポートされた面談データ
 */
export const importMeetingData = (file: File): Promise<Meeting[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        
        // データ形式の検証
        if (!data.meetings || !Array.isArray(data.meetings)) {
          throw new Error('無効なデータ形式です');
        }
        
        // 各面談データの基本的な検証
        const validMeetings = data.meetings.filter((meeting: any) => {
          return meeting && 
                 typeof meeting.id === 'number' && 
                 typeof meeting.name === 'string' && 
                 Array.isArray(meeting.preferredOptions);
        });
        
        resolve(validMeetings);
      } catch (error) {
        reject(new Error('ファイルの読み込みに失敗しました: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsText(file);
  });
};