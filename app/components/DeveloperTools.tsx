import React from 'react';
import { FolderDown, FolderUp, Settings, X } from 'lucide-react';

interface DeveloperToolsDialogProps {
  isOpen: boolean;
  theme: 'light' | 'dark';
  onClose: () => void;
  onDataExport: () => void;
  onDataImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DeveloperToolsDialog: React.FC<DeveloperToolsDialogProps> = ({
  isOpen,
  theme,
  onClose,
  onDataExport,
  onDataImport
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
      <div className={`rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Settings className={`mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
              開発者ツール
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
            title="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          面談データのバックアップとリストア機能です。
        </p>
        
        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={() => {
              onDataExport();
              onClose();
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            title="全データをJSONファイルにエクスポート"
          >
            <FolderDown className="mr-2" size={20} />
            データエクスポート
          </button>
          
          <label className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center cursor-pointer">
            <FolderUp className="mr-2" size={20} />
            データインポート
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                onDataImport(e);
                onClose();
              }}
              className="hidden"
            />
          </label>
        </div>

        <div className={`p-3 rounded-md text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          <p className="font-medium mb-1">⚠️ 注意事項</p>
          <ul className="list-disc list-inside space-y-1">
            <li>データインポートは現在の全データを上書きします</li>
            <li>インポート前に必要に応じてデータエクスポートでバックアップを作成してください</li>
            <li>JSONファイルのみ対応しています</li>
          </ul>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};