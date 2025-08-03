;import { Calendar, User, FileText, Plus, Trash2, AlertTriangle, Check, Camera, X, Users, Edit2, Download, CheckCircle, Upload, Sun, Moon } from 'lucide-react';
import { useMeetingScheduler } from '~/hooks/useMeetingScheduler';
import { useTheme } from '~/hooks/useTheme';
import { generateIcsFile } from '~/utils/icsUtils';
import { formatDate, formatDateShort, getTodayDate } from '~/utils/dateUtils';
import { timeSlots, getTimeSlotLabel, generateScheduleSummary, isSlotOccupied, isRequired } from '~/utils/scheduleUtils';

const MeetingScheduler = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    meetings,
    showForm,
    editingMeeting,
    showImportDialog,
    showTimeDialog,
    timeDialogData,
    notificationTimes,
    formData,
    validationErrors,
    toasts,
    addMeeting,
    editMeeting,
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
    setShowImportDialog,
    setShowTimeDialog,
    setFormData
  } = useMeetingScheduler();

  const scheduleSummary = generateScheduleSummary(meetings);

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
        
        {/* テーマ切り替えボタン */}
        <div className="flex items-center gap-2">
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
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">日付</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">10:00-12:00</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">13:00-16:00</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">17:00以降</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheduleSummary).map(([date, schedules]) => (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {formatDateShort(date)}
                  </td>
                  {timeSlots.filter(timeSlot => timeSlot.value !== 'allday').map(timeSlot => {
                    const schedulesForSlot = schedules.filter(s => {
                      // 終日の場合は全ての時間帯に表示
                      if (s.timeSlot === 'allday') {
                        return true;
                      }
                      // 通常の時間帯マッチング
                      return s.timeSlot === timeSlot.value;
                    });
                    
                    return (
                      <td key={timeSlot.value} className={`border border-gray-200 px-2 py-2 ${
                        schedulesForSlot.length === 0 ? 'bg-gray-50' :
                        schedulesForSlot.length > 1 ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        {schedulesForSlot.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center">空き</div>
                        ) : (
                          <div className="space-y-1">
                            {schedulesForSlot.map((schedule, idx) => (
                              <div key={idx} className="flex items-center space-x-1">
                                {schedule.meetingImage ? (
                                  <img 
                                    src={schedule.meetingImage} 
                                    alt={schedule.meetingName}
                                    className="w-4 h-4 rounded-full object-cover border flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User size={8} className="text-gray-600" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-800 truncate">
                                    {schedule.meetingName}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    第{schedule.priority}希望{schedule.timeSlot === 'allday' ? '（終日）' : ''}
                                  </div>
                                </div>
                                {schedulesForSlot.length > 1 && idx === 0 && (
                                  <AlertTriangle className="text-red-500 flex-shrink-0" size={12} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
            <span className="text-gray-600">空き</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-gray-600">予定あり</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span className="text-gray-600">重複</span>
            <AlertTriangle className="text-red-500 ml-1" size={12} />
          </div>
        </div>
      </div>
    )}

    {/* icsインポートダイアログ */}
    {showImportDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">詳細時刻設定</h3>
          <p className="text-gray-600 mb-4 text-sm">
            {formatDate(timeDialogData.date)} ({getTimeSlotLabel(timeDialogData.timeSlot)})
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始時刻</label>
              <input
                type="time"
                id="startTime"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了時刻</label>
              <input
                type="time"
                id="endTime"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button
              onClick={() => {
                setShowTimeDialog(false);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="面談相手の名前"
            />
            {validationErrors.name && (
              <div className="text-red-600 text-xs mt-1">{validationErrors.name}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">画像（任意）</label>
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
                className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      validationErrors[`date_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors[`date_${index}`] && (
                    <div className="text-red-600 text-xs mt-1">{validationErrors[`date_${index}`]}</div>
                  )}
                </div>
                <div className="flex-1">
                  <select
                    value={option.timeSlot}
                    onChange={(e) => updatePreferredOption(index, 'timeSlot', e.target.value)}
                    className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[`timeSlot_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">時間帯を選択</option>
                    {timeSlots.map(slot => {
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
                    <div className="text-red-600 text-xs mt-1">{validationErrors[`timeSlot_${index}`]}</div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div key={meeting.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {meeting.image ? (
                      <img 
                        src={meeting.image} 
                        alt={meeting.name}
                        className="w-8 h-8 rounded-full mr-3 object-cover border"
                      />
                    ) : (
                      <User className="mr-3 text-blue-600" size={24} />
                    )}
                    <h3 className="font-semibold text-lg">{meeting.name}</h3>
                  </div>
                  
                  {meeting.notes && (
                    <div className="flex items-start mb-2">
                      <FileText className="mr-2 text-gray-500 mt-0.5" size={16} />
                      <span className="text-gray-700 text-sm">{meeting.notes}</span>
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
                    onClick={() => editMeeting(meeting)}
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
                  <span className="text-sm font-medium text-gray-700">希望日程（クリックで確定）:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {meeting.preferredOptions.map((option, index) => (
                    <div key={index} className="relative">
                      <button
                        onClick={() => confirmMeeting(meeting.id, option.date, option.timeSlot)}
                        className={`w-full p-2 text-sm rounded border transition-colors text-left ${
                          meeting.confirmedDate === option.date && meeting.confirmedTimeSlot === option.timeSlot
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium text-gray-800">第{index + 1}希望</div>
                        <div className="text-gray-700">{formatDate(option.date)}</div>
                        <div className="text-xs text-gray-600 mt-1">{getTimeSlotLabel(option.timeSlot)}</div>
                        {meeting.confirmedDate === option.date && meeting.confirmedTimeSlot === option.timeSlot && (
                          <Check size={16} className="absolute top-2 right-2 text-green-600" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                
                {meeting.status === 'confirmed' && meeting.confirmedDate && meeting.confirmedTimeSlot && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm flex justify-between items-center">
                    <div>
                      <strong>確定日程:</strong> {formatDate(meeting.confirmedDate)} ({getTimeSlotLabel(meeting.confirmedTimeSlot)})
                      {meeting.confirmedStartTime && meeting.confirmedEndTime && (
                        <div className="text-xs text-gray-600 mt-1">
                          時刻: {meeting.confirmedStartTime} - {meeting.confirmedEndTime}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => resetConfirmation(meeting.id)}
                      className="text-gray-600 hover:text-gray-800 text-xs underline"
                    >
                      確定を取り消す
                    </button>
                  </div>
                )}
              </div>
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
            {toast.type === 'error' && <AlertTriangle size={20} className="text-red-600" />}
            {toast.type === 'info' && <Calendar size={20} className="text-blue-600" />}
          </div>
          <div className="flex-1 text-sm font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
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
