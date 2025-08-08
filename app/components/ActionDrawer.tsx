import { Menu, X, Settings, Sun, Moon, Eye, EyeOff, Play } from 'lucide-react';
import { useState } from 'react';

interface ActionDrawerProps {
  theme: 'light' | 'dark';
  privacyMode: boolean;
  isDemoMode: boolean;
  onToggleTheme: () => void;
  onTogglePrivacyMode: () => void;
  onToggleDemoMode: () => void;
  onOpenDeveloperTools: () => void;
}

export const ActionDrawer = ({
  theme,
  privacyMode,
  isDemoMode,
  onToggleTheme,
  onTogglePrivacyMode,
  onToggleDemoMode,
  onOpenDeveloperTools
}: ActionDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);
  const closeDrawer = () => setIsOpen(false);

  const handleSettingClick = (action: () => void) => {
    action();
    // 設定ボタンはドロワーを閉じない
  };

  const handleActionClick = (action: () => void) => {
    action();
    closeDrawer();
  };

  return (
    <>
      {/* ドロワー切り替えボタン */}
      <button
        onClick={toggleDrawer}
        className="theme-toggle"
        title="メニューを開く"
      >
        <Menu />
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black z-40"
          onClick={closeDrawer}
          style={{ opacity: 0.5}}
        />
      )}

      {/* ドロワー */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-80 z-50 transform transition-transform duration-300 ease-in-out shadow-lg ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              メニュー
            </h3>
            <button
              onClick={closeDrawer}
              className="theme-toggle"
            >
              <X />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* 設定 */}
              <div className="space-y-2">
                <h4 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  設定
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSettingClick(onToggleTheme)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      {theme === 'light' ? <Sun className="mr-2 w-5 h-5" /> : <Moon className="mr-2 w-5 h-5" />}
                      <span>テーマ</span>
                    </div>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {theme === 'light' ? 'ライト' : 'ダーク'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSettingClick(onTogglePrivacyMode)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      {privacyMode ? <EyeOff className="mr-2 w-5 h-5" /> : <Eye className="mr-2 w-5 h-5" />}
                      <span>プライバシーモード</span>
                    </div>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {privacyMode ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSettingClick(onToggleDemoMode)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isDemoMode 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Play className="mr-2 w-5 h-5" />
                      <span>デモモード</span>
                    </div>
                    <span className={`text-sm ${
                      isDemoMode ? 'text-green-100' : 
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {isDemoMode ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 開発者ツール */}
              <div className="space-y-2">
                <h4 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ツール
                </h4>
                <button
                  onClick={() => handleActionClick(onOpenDeveloperTools)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <Settings className="mr-2 w-5 h-5" />
                  <span>開発者ツール</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};