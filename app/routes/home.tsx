import { Calendar, User, FileText, Plus, Trash2, AlertTriangle, Check, Camera, X, Users, Edit2, Download, CheckCircle, Upload, Sun, Moon, Save, Monitor, MapPin, Eye, EyeOff, FolderDown, FolderUp } from 'lucide-react';
import { useMeetingScheduler } from '~/hooks/useMeetingScheduler';
import { useTheme } from '~/hooks/useTheme';
import { generateIcsFile, generateUnifiedIcsFile } from '~/utils/icsUtils';
import { formatDate, formatDateShort, getTodayDate } from '~/utils/dateUtils';
import { timeSlots, getTimeSlotLabel, generateScheduleSummary, isSlotOccupied, isRequired, getFilteredConfirmedMeetings, getDefaultTimeFromSlot } from '~/utils/scheduleUtils';
import { renderFormattedText } from '~/utils/textUtils';
import { getPrivacyIdentifier, getPrivacyColor, getMeetingIdFromSchedule } from '~/utils/privacyUtils';

const MeetingScheduler = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    meetings,
    showForm,
    editingMeeting,
    inlineEditingId,
    showImportDialog,
    showTimeDialog,
    timeDialogData,
    notificationTimes,
    formData,
    validationErrors,
    toasts,
    privacyMode,
    addMeeting,
    editMeeting,
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit,
    updateInlineMeetingField,
    deleteMeeting,
    confirmMeeting,
    finalizeConfirmation,
    resetConfirmation,
    handleIcsImport,
    removeToast,
    handleImageUpload,
    removeImage,
    updatePreferredOption,
    resetForm,
    openNewMeetingForm,
    togglePrivacyMode,
    scrollToMeeting,
    handleDataExport,
    handleDataImport,
    setShowImportDialog,
    setShowTimeDialog,
    setFormData,
    isDevelopmentMode
  } = useMeetingScheduler();

  const scheduleSummary = generateScheduleSummary(meetings);
  const confirmedMeetings = getFilteredConfirmedMeetings(meetings);
  const allMeetingIds = meetings.map(m => m.id);

return (
  <div className={`max-w-6xl mx-auto p-6 min-h-screen transition-colors ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            <Calendar className={`mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            面談・ミーティング調整ツール
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>複数の人との面談日程を効率的に調整し、重複を防ぎます</p>
        </div>
        
        {/* テーマ切り替えボタンとプライバシーモード切り替えボタン */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePrivacyMode}
            className="theme-toggle"
            title={`プライバシーモード: ${privacyMode ? 'ON（情報を隠す）' : 'OFF（情報を表示）'}`}
          >
            {privacyMode ? (
              <EyeOff />
            ) : (
              <Eye />
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`現在: ${theme === 'light' ? 'ライト' : 'ダーク'}モード`}
          >
            {theme === 'light' ? (
              <Sun />
            ) : (
              <Moon />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={openNewMeetingForm}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="mr-2" size={20} />
          新しい面談を追加
        </button>
        
        <button
          onClick={() => setShowImportDialog(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Upload className="mr-2" size={20} />
          icsファイルをインポート
        </button>

        {/* 開発モード専用のデータバックアップ機能 */}
        {isDevelopmentMode && (
          <>
            <button
              onClick={handleDataExport}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              title="全データをJSONファイルにエクスポート"
            >
              <FolderDown className="mr-2" size={20} />
              データエクスポート
            </button>
            
            <label className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center cursor-pointer">
              <FolderUp className="mr-2" size={20} />
              データインポート
              <input
                type="file"
                accept=".json"
                onChange={handleDataImport}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </div>

    {/* 予定サマリー */}
    {Object.keys(scheduleSummary).length > 0 && (
      <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
          <Users className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
          予定サマリー
        </h2>
        
        {/* 一覧表示 */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <th className={`border px-2 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>日付</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>10:00<br />~11:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>11:00<br />~12:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>12:00<br />~13:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>13:00<br />~14:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>14:00<br />~15:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>15:00<br />~16:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>16:00<br />~17:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>17:00<br />~18:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>18:00<br />~19:00</th>
                <th className={`border px-2 py-3 text-center text-xs font-semibold w-24 ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}>19:00<br />~20:00</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheduleSummary).map(([date, schedules]) => {
                // 確定された面談の時間を取得（確定日時のみ）
                const confirmedMeetings = meetings.filter(m => 
                  m.status === 'confirmed' && 
                  m.confirmedDate === date && 
                  m.confirmedStartTime && 
                  m.confirmedEndTime
                );
                
                return (
                  <tr key={date} className={theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}>
                    <td className={`border px-2 py-3 font-medium whitespace-nowrap ${theme === 'dark' ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-800'}`}>
                      {formatDateShort(date)}
                    </td>
                    {Array.from({ length: 10 }, (_, i) => i + 10).map(hour => {
                      // この時間帯にある予定を確認
                      const schedulesForHour = schedules.filter(s => {
                        // 終日の場合は全ての時間帯に表示
                        if (s.timeSlot === 'allday') {
                          return true;
                        }
                        // 時間帯での大まかな判定
                        if (s.timeSlot === 'morning' && hour >= 10 && hour <= 12) return true;
                        if (s.timeSlot === 'afternoon' && hour >= 13 && hour <= 16) return true;
                        if (s.timeSlot === 'evening' && hour >= 17 && hour <= 19) return true;
                        // 1時間単位の時間帯判定
                        if (s.timeSlot.includes('-')) {
                          const [startHour, endHour] = s.timeSlot.split('-').map(Number);
                          return hour >= startHour && hour < endHour;
                        }
                        return false;
                      });
                      
                      // 確定された面談でこの時間帯にあるものを確認
                      const confirmedInThisHour = confirmedMeetings.filter(m => {
                        // 具体的な時刻が設定されている場合は、それを優先する
                        if (m.confirmedStartTime && m.confirmedEndTime) {
                          const startHour = parseInt(m.confirmedStartTime.split(':')[0]);
                          const endHour = parseInt(m.confirmedEndTime.split(':')[0]);
                          return hour >= startHour && hour < endHour;
                        }
                        // 具体的な時刻がない場合のみ時間帯で判定
                        if (m.confirmedTimeSlot === 'allday') {
                          return true;
                        }
                        if (m.confirmedTimeSlot === 'morning' && hour >= 10 && hour <= 12) return true;
                        if (m.confirmedTimeSlot === 'afternoon' && hour >= 13 && hour <= 16) return true;
                        if (m.confirmedTimeSlot === 'evening' && hour >= 17 && hour <= 19) return true;
                        // 1時間単位の時間帯判定
                        if (m.confirmedTimeSlot && m.confirmedTimeSlot.includes('-')) {
                          const [startHour, endHour] = m.confirmedTimeSlot.split('-').map(Number);
                          return hour >= startHour && hour < endHour;
                        }
                        return false;
                      });
                      
                      const hasConfirmed = confirmedInThisHour.length > 0;
                      const hasScheduled = schedulesForHour.length > 0;
                      const hasMultiple = schedulesForHour.length > 1 || confirmedInThisHour.length > 1 || (schedulesForHour.length > 0 && confirmedInThisHour.length > 0);
                      
                      return (
                        <td key={hour} className={`border px-2 py-3 text-center min-h-24 w-24 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} ${
                          !hasScheduled && !hasConfirmed ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50') :
                          hasMultiple ? (theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50') : 
                          hasConfirmed ? (theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50') : (theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50')
                        }`}>
                          {!hasScheduled && !hasConfirmed ? (
                            <div className="text-xs text-gray-400">-</div>
                          ) : (
                            <div className="space-y-1">
                              {/* 確定された面談を表示 */}
                              {confirmedInThisHour.map((meeting, idx) => (
                                <div key={`confirmed-${idx}`} className="relative group">
                                  <div className="flex flex-col items-center">
                                    <div className="relative">
                                      {privacyMode ? (
                                        <div 
                                          className={`w-10 h-10 ${getPrivacyColor(meeting.id, allMeetingIds)} rounded-full mx-auto flex items-center justify-center`}
                                          title={`${getPrivacyIdentifier(meeting.id, allMeetingIds)}（確定）`}
                                        >
                                          <User className="text-white" size={16} />
                                        </div>
                                      ) : meeting.image ? (
                                        <img 
                                          src={meeting.image} 
                                          alt={meeting.name}
                                          className="w-10 h-10 rounded-full object-cover border mx-auto"
                                          title={`${meeting.name}（確定）`}
                                        />
                                      ) : (
                                        <div 
                                          className="w-10 h-10 bg-green-500 rounded-full mx-auto flex items-center justify-center"
                                          title={`${meeting.name}（確定）`}
                                        >
                                          <User className="text-white" size={16} />
                                        </div>
                                      )}
                                      {/* オンライン・オフラインアイコン */}
                                      <div className="absolute -bottom-0.5 -right-1">
                                        {(meeting.meetingType || 'offline') === 'online' ? (
                                          <Monitor className="w-5 h-5 text-cyan-500 bg-white rounded-full p-0.5 border border-gray-200" size={18} />
                                        ) : (
                                          <MapPin className="w-5 h-5 text-orange-600 bg-white rounded-full p-0.5 border border-gray-200" size={18} />
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => scrollToMeeting(meeting.id)}
                                      className={`text-xs font-medium mt-0.5 leading-tight break-words cursor-pointer hover:underline transition-all ${theme === 'dark' ? 'text-green-300 hover:text-green-200' : 'text-green-700 hover:text-green-800'}`}
                                    >
                                      {privacyMode ? getPrivacyIdentifier(meeting.id, allMeetingIds) : (meeting.name.length > 8 ? meeting.name.substring(0, 6) + '…' : meeting.name)}
                                    </button>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                      {meeting.confirmedTimeSlot === 'allday' && !meeting.confirmedStartTime && !meeting.confirmedEndTime ? '確定（終日）' : '確定'}
                                    </div>
                                  </div>
                                  {hasMultiple && idx === 0 && (
                                    <AlertTriangle className="text-red-500 absolute -top-1 -right-1" size={8} />
                                  )}
                                </div>
                              ))}
                              {/* 希望予定を表示 */}
                              {schedulesForHour.map((schedule, idx) => {
                                const meetingId = getMeetingIdFromSchedule(meetings, schedule.meetingName);
                                return (
                                <div key={`schedule-${idx}`} className="relative group">
                                  <div className="flex flex-col items-center">
                                    <div className="relative">
                                      {privacyMode ? (
                                        <div 
                                          className={`w-10 h-10 ${getPrivacyColor(meetingId, allMeetingIds)} rounded-full mx-auto opacity-70 flex items-center justify-center`}
                                          title={`${getPrivacyIdentifier(meetingId, allMeetingIds)}（第${schedule.priority}希望）`}
                                        >
                                          <User className="text-white" size={16} />
                                        </div>
                                      ) : schedule.meetingImage ? (
                                        <img 
                                          src={schedule.meetingImage} 
                                          alt={schedule.meetingName}
                                          className="w-10 h-10 rounded-full object-cover border mx-auto opacity-70"
                                          title={`${schedule.meetingName}（第${schedule.priority}希望）`}
                                        />
                                      ) : (
                                        <div 
                                          className="w-10 h-10 bg-blue-400 rounded-full mx-auto opacity-70 flex items-center justify-center"
                                          title={`${schedule.meetingName}（第${schedule.priority}希望）`}
                                        >
                                          <User className="text-white" size={16} />
                                        </div>
                                      )}
                                      {/* オンライン・オフラインアイコン */}
                                      <div className="absolute -bottom-0.5 -right-1">
                                        {(schedule.meetingType || 'offline') === 'online' ? (
                                          <Monitor className="w-5 h-5 text-cyan-500 bg-white rounded-full p-0.5 border border-gray-200 opacity-80" size={18} />
                                        ) : (
                                          <MapPin className="w-5 h-5 text-orange-600 bg-white rounded-full p-0.5 border border-gray-200 opacity-80" size={18} />
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => scrollToMeeting(meetingId)}
                                      className={`text-xs font-medium mt-0.5 leading-tight break-words cursor-pointer hover:underline transition-all ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-800'}`}
                                    >
                                      {privacyMode ? getPrivacyIdentifier(meetingId, allMeetingIds) : (schedule.meetingName.length > 8 ? schedule.meetingName.substring(0, 6) + '…' : schedule.meetingName)}
                                    </button>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {schedule.timeSlot === 'allday' ? `第${schedule.priority}希望（終日）` : `第${schedule.priority}希望`}
                                    </div>
                                  </div>
                                  {hasMultiple && idx === 0 && (
                                    <AlertTriangle className="text-red-500 absolute -top-1 -right-1" size={8} />
                                  )}
                                </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}></div>
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>空き</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 border rounded ${theme === 'dark' ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}></div>
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>予定あり</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 border rounded ${theme === 'dark' ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}></div>
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>確定</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 border rounded ${theme === 'dark' ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}></div>
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>重複</span>
            <AlertTriangle className="text-red-500 ml-1" size={12} />
          </div>
          <div className="flex items-center space-x-1">
            <Monitor className="text-cyan-500" size={16} />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>オンライン</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="text-orange-600" size={16} />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>対面</span>
          </div>
        </div>
      </div>
    )}

    {/* 確定面談一覧 */}
    {confirmedMeetings.length > 0 && (
      <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            <CheckCircle className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            確定面談一覧
          </h2>
          <button
            onClick={() => generateUnifiedIcsFile(meetings, notificationTimes)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            title="確定済みの全ての面談を統合したICSファイルをダウンロード"
          >
            <Download className="mr-2" size={16} />
            統合ICSエクスポート
          </button>
        </div>
        
        <div className="space-y-3">
          {confirmedMeetings.map(meeting => (
            <div key={meeting.id} className={`flex items-center justify-between p-3 rounded-lg border ${theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center">
                {privacyMode ? (
                  <div className={`w-8 h-8 ${getPrivacyColor(meeting.id, allMeetingIds)} rounded-full mr-3 flex items-center justify-center`}>
                    <User className="text-white" size={16} />
                  </div>
                ) : meeting.image ? (
                  <img 
                    src={meeting.image} 
                    alt={meeting.name}
                    className="w-8 h-8 rounded-full mr-3 object-cover border"
                  />
                ) : (
                  <div className="w-8 h-8 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                    <User className="text-white" size={16} />
                  </div>
                )}
                <div>
                  <button 
                    onClick={() => scrollToMeeting(meeting.id)}
                    className={`font-medium cursor-pointer hover:underline transition-all text-left ${theme === 'dark' ? 'text-gray-100 hover:text-gray-50' : 'text-gray-800 hover:text-gray-900'}`}
                  >
                    {privacyMode ? getPrivacyIdentifier(meeting.id, allMeetingIds) : meeting.name}
                  </button>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(meeting.confirmedDate!)} 
                    {meeting.confirmedStartTime && meeting.confirmedEndTime && (
                      <span className="ml-2">
                        {meeting.confirmedStartTime} - {meeting.confirmedEndTime}
                      </span>
                    )}
                    {!meeting.confirmedStartTime && meeting.confirmedTimeSlot && (
                      <span className="ml-2">
                        ({getTimeSlotLabel(meeting.confirmedTimeSlot)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded ${theme === 'dark' ? 'bg-green-700 text-green-100' : 'bg-green-100 text-green-800'}`}>
                確定済み
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* icsインポートダイアログ */}
    {showImportDialog && (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
        <div className={`rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>icsファイルをインポート</h3>
          <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            カレンダーアプリからエクスポートしたicsファイルを選択してください。
            イベント情報が面談として追加されます。
          </p>
          <div className="mb-6">
            <input
              type="file"
              accept=".ics"
              onChange={handleIcsImport}
              className={`w-full text-sm cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100`}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowImportDialog(false)}
              className={`px-4 py-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 時刻設定ダイアログ */}
    {showTimeDialog && timeDialogData && (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
        <div className={`rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>詳細時刻設定</h3>
          <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatDate(timeDialogData.date)} ({getTimeSlotLabel(timeDialogData.timeSlot)})
          </p>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>開始時刻</label>
              <input
                type="time"
                id="startTime"
                defaultValue={getDefaultTimeFromSlot(timeDialogData.timeSlot)[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>終了時刻</label>
              <input
                type="time"
                id="endTime"
                defaultValue={getDefaultTimeFromSlot(timeDialogData.timeSlot)[1]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button
              onClick={() => {
                setShowTimeDialog(false);
              }}
              className={`px-4 py-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                const startTimeElement = document.getElementById('startTime') as HTMLInputElement;
                const endTimeElement = document.getElementById('endTime') as HTMLInputElement;
                const startTime = startTimeElement?.value;
                const endTime = endTimeElement?.value;
                if (startTime && endTime) {
                  finalizeConfirmation(startTime, endTime);
                } else {
                  alert('開始時刻と終了時刻を入力してください');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              確定
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 新規追加フォーム */}
    {showForm && (
      <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
          <User className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
          {editingMeeting ? '面談を編集' : '新しい面談を追加'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              名前 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.name ? 
                  (theme === 'dark' ? 'border-red-500 bg-red-900/20 text-gray-100' : 'border-red-300 bg-red-50') : 
                  (theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300')
              }`}
              placeholder="面談相手の名前"
            />
            {validationErrors.name && (
              <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{validationErrors.name}</div>
            )}
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>画像（任意）</label>
            <div className="flex items-center space-x-2">
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="プレビュー"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Camera className="text-gray-400" size={20} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            希望日程と時間帯（第1希望は必須）
          </label>
          <div className="space-y-3">
            {formData.preferredOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-16 text-sm font-medium text-gray-600">
                  第{index + 1}希望{isRequired(index) ? ' *' : ''}
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={option.date}
                    min={getTodayDate()}
                    onChange={(e) => updatePreferredOption(index, 'date', e.target.value)}
                    className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[`date_${index}`] ? 
                        (theme === 'dark' ? 'border-red-500 bg-red-900/20 text-gray-100' : 'border-red-300 bg-red-50') : 
                        (theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300')
                    }`}
                  />
                  {validationErrors[`date_${index}`] && (
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{validationErrors[`date_${index}`]}</div>
                  )}
                </div>
                <div className="flex-1">
                  <select
                    value={option.timeSlot}
                    onChange={(e) => updatePreferredOption(index, 'timeSlot', e.target.value)}
                    className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[`timeSlot_${index}`] ? 
                        (theme === 'dark' ? 'border-red-500 bg-red-900/20 text-gray-100' : 'border-red-300 bg-red-50') : 
                        (theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300')
                    }`}
                  >
                    <option value="">時間帯を選択</option>
                    {timeSlots.map(slot => {
                      if (slot.disabled) {
                        return (
                          <option 
                            key={slot.value} 
                            value=""
                            disabled
                            className="text-gray-400"
                          >
                            {slot.label}
                          </option>
                        );
                      }
                      const isOccupied = isSlotOccupied(option.date, slot.value, meetings, editingMeeting, formData, index);
                      return (
                        <option 
                          key={slot.value} 
                          value={slot.value}
                          className={isOccupied ? 'text-orange-600' : ''}
                        >
                          {slot.label}{isOccupied ? ' (重複)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {validationErrors[`timeSlot_${index}`] && (
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{validationErrors[`timeSlot_${index}`]}</div>
                  )}
                  {option.date && option.timeSlot && isSlotOccupied(option.date, option.timeSlot, meetings, editingMeeting, formData, index) && (
                    <div className="text-orange-600 text-xs mt-1 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      この日時は既に他の希望と重複しています
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>面談形式</label>
          <div className="flex gap-4">
            <label className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="radio"
                name="meetingType"
                value="offline"
                checked={(formData.meetingType || 'offline') === 'offline'}
                onChange={(e) => setFormData({...formData, meetingType: e.target.value as 'online' | 'offline'})}
                className="mr-2"
              />
              <MapPin className="mr-1 text-orange-600" size={16} />
              対面
            </label>
            <label className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="radio"
                name="meetingType"
                value="online"
                checked={(formData.meetingType || 'offline') === 'online'}
                onChange={(e) => setFormData({...formData, meetingType: e.target.value as 'online' | 'offline'})}
                className="mr-2"
              />
              <Monitor className="mr-1 text-cyan-500" size={16} />
              オンライン
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>備考</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
            rows={2}
            placeholder="面談の目的や特記事項など"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={addMeeting}
            disabled={Object.keys(validationErrors).length > 0}
            className={`px-4 py-2 rounded-md transition-colors ${
              Object.keys(validationErrors).length > 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {editingMeeting ? '更新' : '追加'}
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    )}

    {/* 面談リスト */}
    <div className={`rounded-lg shadow-lg p-6 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>面談リスト ({meetings.length}件)</h2>
      
      {meetings.length === 0 ? (
        <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          まだ面談が登録されていません
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map(meeting => (
            <div key={meeting.id} id={`meeting-${meeting.id}`} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
              {inlineEditingId === meeting.id ? (
                // 編集モード - 登録フォームと同じUI
                <div>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                    <User className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    面談を編集
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        名前 *
                      </label>
                      <input
                        type="text"
                        value={meeting.name}
                        onChange={(e) => updateInlineMeetingField(meeting.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !meeting.name.trim() ? 
                            (theme === 'dark' ? 'border-red-500 bg-red-900/20 text-gray-100' : 'border-red-300 bg-red-50') : 
                            (theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300')
                        }`}
                        placeholder="面談相手の名前"
                      />
                      {!meeting.name.trim() && (
                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>名前は必須です</div>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>画像（任意）</label>
                      <div className="flex items-center space-x-2">
                        {meeting.image ? (
                          <div className="relative">
                            <img 
                              src={meeting.image} 
                              alt="プレビュー"
                              className="w-12 h-12 rounded-full object-cover border"
                            />
                            <button
                              onClick={() => updateInlineMeetingField(meeting.id, 'image', '')}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Camera className="text-gray-400" size={20} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const result = e.target?.result;
                                if (typeof result === 'string') {
                                  updateInlineMeetingField(meeting.id, 'image', result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className={`text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      希望日程と時間帯（第1希望は必須）
                    </label>
                    <div className="space-y-3">
                      {Array.from({ length: 5 }, (_, index) => {
                        const option = meeting.preferredOptions[index] || { date: '', timeSlot: '' };
                        const tempFormData = {
                          name: meeting.name,
                          image: meeting.image,
                          notes: meeting.notes,
                          meetingType: meeting.meetingType || 'offline',
                          preferredOptions: meeting.preferredOptions.length >= 5 
                            ? meeting.preferredOptions 
                            : [...meeting.preferredOptions, ...Array(5 - meeting.preferredOptions.length).fill({ date: '', timeSlot: '' })]
                        };
                        const isCurrentSlotOccupied = option.date && option.timeSlot && isSlotOccupied(option.date, option.timeSlot, meetings, meeting, tempFormData, index);
                        
                        return (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-16 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              第{index + 1}希望{index === 0 ? ' *' : ''}
                            </div>
                            <div className="flex-1">
                              <input
                                type="date"
                                value={option.date}
                                min={getTodayDate()}
                                onChange={(e) => {
                                  const newOptions = [...meeting.preferredOptions];
                                  while (newOptions.length <= index) {
                                    newOptions.push({ date: '', timeSlot: '' });
                                  }
                                  newOptions[index] = { ...newOptions[index], date: e.target.value };
                                  updateInlineMeetingField(meeting.id, 'preferredOptions', newOptions);
                                }}
                                className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  index === 0 && !option.date ? 
                                    (theme === 'dark' ? 'border-red-500 bg-red-900/20 text-gray-100' : 'border-red-300 bg-red-50') : 
                                    (theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300')
                                }`}
                              />
                              {index === 0 && !option.date && (
                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>第1希望の日程は必須です</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <select
                                value={option.timeSlot}
                                onChange={(e) => {
                                  const newOptions = [...meeting.preferredOptions];
                                  while (newOptions.length <= index) {
                                    newOptions.push({ date: '', timeSlot: '' });
                                  }
                                  newOptions[index] = { ...newOptions[index], timeSlot: e.target.value };
                                  updateInlineMeetingField(meeting.id, 'preferredOptions', newOptions);
                                }}
                                className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  index === 0 && !option.timeSlot ? 
                                    (theme === 'dark' ? 'border-red-500 bg-red-900/20 text-gray-100' : 'border-red-300 bg-red-50') : 
                                    (theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300')
                                }`}
                              >
                                <option value="">時間帯を選択</option>
                                {timeSlots.map(slot => {
                                  if (slot.disabled) {
                                    return (
                                      <option 
                                        key={slot.value} 
                                        value=""
                                        disabled
                                        className="text-gray-400"
                                      >
                                        {slot.label}
                                      </option>
                                    );
                                  }
                                  const tempFormDataForSlot = {
                                    name: meeting.name,
                                    image: meeting.image,
                                    notes: meeting.notes,
                                    meetingType: meeting.meetingType || 'offline',
                                    preferredOptions: meeting.preferredOptions.length >= 5 
                                      ? meeting.preferredOptions.map((opt, i) => i === index ? { ...opt, timeSlot: slot.value } : opt)
                                      : [...meeting.preferredOptions.map((opt, i) => i === index ? { ...opt, timeSlot: slot.value } : opt), ...Array(Math.max(0, 5 - meeting.preferredOptions.length)).fill({ date: '', timeSlot: '' })]
                                  };
                                  const isSlotOccupiedInSelect = option.date && isSlotOccupied(option.date, slot.value, meetings, meeting, tempFormDataForSlot, index);
                                  return (
                                    <option 
                                      key={slot.value} 
                                      value={slot.value}
                                      className={isSlotOccupiedInSelect ? 'text-orange-600' : ''}
                                    >
                                      {slot.label}{isSlotOccupiedInSelect ? ' (重複)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              {index === 0 && !option.timeSlot && (
                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>第1希望の時間帯は必須です</div>
                              )}
                              {isCurrentSlotOccupied && (
                                <div className="text-orange-600 text-xs mt-1 flex items-center">
                                  <AlertTriangle size={12} className="mr-1" />
                                  この日時は既に他の希望と重複しています
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>面談形式</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`meetingType-${meeting.id}`}
                          value="offline"
                          checked={(meeting.meetingType || 'offline') === 'offline'}
                          onChange={(e) => updateInlineMeetingField(meeting.id, 'meetingType', e.target.value as 'online' | 'offline')}
                          className="mr-2"
                        />
                        <MapPin className="mr-1" size={16} />
                        <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>対面</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`meetingType-${meeting.id}`}
                          value="online"
                          checked={(meeting.meetingType || 'offline') === 'online'}
                          onChange={(e) => updateInlineMeetingField(meeting.id, 'meetingType', e.target.value as 'online' | 'offline')}
                          className="mr-2"
                        />
                        <Monitor className="mr-1" size={16} />
                        <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>オンライン</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>備考</label>
                    <textarea
                      value={meeting.notes}
                      onChange={(e) => updateInlineMeetingField(meeting.id, 'notes', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'border-gray-300'}`}
                      rows={2}
                      placeholder="面談の目的や特記事項など"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // 必須項目チェック
                        if (!meeting.name.trim() || !meeting.preferredOptions[0]?.date || !meeting.preferredOptions[0]?.timeSlot) {
                          alert('名前と第1希望の日程・時間帯は必須です。');
                          return;
                        }
                        cancelInlineEdit();
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => cancelInlineEdit()}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 閲覧モード
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {privacyMode ? (
                          <div className={`w-8 h-8 ${getPrivacyColor(meeting.id, allMeetingIds)} rounded-full mr-3 flex items-center justify-center`}>
                            <User className="text-white" size={16} />
                          </div>
                        ) : meeting.image ? (
                          <img 
                            src={meeting.image} 
                            alt={meeting.name}
                            className="w-8 h-8 rounded-full mr-3 object-cover border"
                          />
                        ) : (
                          <User className="mr-3 text-blue-600" size={24} />
                        )}
                        <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                          {privacyMode ? getPrivacyIdentifier(meeting.id, allMeetingIds) : meeting.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        {(meeting.meetingType || 'offline') === 'online' ? (
                          <Monitor className="mr-2 text-cyan-500" size={16} />
                        ) : (
                          <MapPin className="mr-2 text-orange-600" size={16} />
                        )}
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {(meeting.meetingType || 'offline') === 'online' ? 'オンライン' : '対面'}
                        </span>
                      </div>
                      
                      {meeting.notes && (
                        <div className="flex items-start mb-2">
                          <FileText className="mr-2 text-gray-500 mt-0.5" size={16} />
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {privacyMode ? `${getPrivacyIdentifier(meeting.id, allMeetingIds)}のメモ` : renderFormattedText(meeting.notes, theme === 'dark')}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {meeting.status === 'confirmed' && meeting.confirmedDate && meeting.confirmedStartTime && meeting.confirmedEndTime && (
                        <button
                          onClick={() => generateIcsFile(meeting, notificationTimes)}
                          className="text-purple-600 hover:text-purple-800 transition-colors flex items-center"
                          title="icsファイルをダウンロード"
                        >
                          <Download size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => startInlineEdit(meeting.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="編集"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="mb-2">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        希望日程（クリックで確定）:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {meeting.preferredOptions
                        .filter(option => option.date && option.timeSlot)
                        .map((option, index) => (
                          <div key={index} className="relative">
                            <button
                              onClick={() => confirmMeeting(meeting.id, option.date, option.timeSlot)}
                              className={`w-full p-2 text-sm rounded border transition-colors text-left ${
                                meeting.confirmedDate === option.date && meeting.confirmedTimeSlot === option.timeSlot
                                  ? (theme === 'dark' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-100 border-green-500 text-green-800')
                                  : (theme === 'dark' ? 'bg-gray-600 border-gray-500 hover:bg-gray-500 text-gray-200' : 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-gray-800')
                              }`}
                            >
                              <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                第{meeting.preferredOptions.findIndex(opt => opt.date === option.date && opt.timeSlot === option.timeSlot) + 1}希望
                              </div>
                              <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{formatDate(option.date)}</div>
                              <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{getTimeSlotLabel(option.timeSlot)}</div>
                              {meeting.confirmedDate === option.date && meeting.confirmedTimeSlot === option.timeSlot && (
                                <Check size={16} className="absolute top-2 right-2 text-green-600" />
                              )}
                            </button>
                          </div>
                        ))}
                    </div>
                    
                    {meeting.status === 'confirmed' && meeting.confirmedDate && meeting.confirmedTimeSlot && (
                      <div className={`mt-3 p-3 rounded text-sm flex justify-between items-center ${theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                        <div>
                          <strong>確定日程:</strong> {formatDate(meeting.confirmedDate)} ({getTimeSlotLabel(meeting.confirmedTimeSlot)})
                          {meeting.confirmedStartTime && meeting.confirmedEndTime && (
                            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              時刻: {meeting.confirmedStartTime} - {meeting.confirmedEndTime}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => resetConfirmation(meeting.id)}
                          className={`text-xs underline transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                        >
                          確定を取り消す
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Toast通知 */}
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform ${
            toast.type === 'success' 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : toast.type === 'error'
              ? 'bg-red-100 border border-red-200 text-red-800'
              : 'bg-blue-100 border border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex-shrink-0 mr-3">
            {toast.type === 'success' && <CheckCircle size={20} className="text-green-600" />}
            {toast.type === 'error' && <AlertTriangle size={20} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />}
            {toast.type === 'info' && <Calendar size={20} className="text-blue-600" />}
          </div>
          <div className="flex-1 text-sm font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`flex-shrink-0 ml-3 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
);
};

export default MeetingScheduler;
