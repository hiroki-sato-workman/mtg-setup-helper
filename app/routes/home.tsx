import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Plus, Trash2, AlertTriangle, Check, Camera, X, Users, Edit2, Download, CheckCircle, Upload, Sun, Moon } from 'lucide-react';

interface PreferredOption {
  date: string;
  timeSlot: string;
}

interface Meeting {
  id: number;
  name: string;
  image: string;
  notes: string;
  preferredOptions: PreferredOption[];
  confirmedDate: string;
  confirmedTimeSlot: string;
  confirmedStartTime: string;
  confirmedEndTime: string;
  status: 'pending' | 'confirmed';
}

interface FormData {
  name: string;
  image: string;
  notes: string;
  preferredOptions: PreferredOption[];
}

interface ValidationErrors {
  [key: string]: string;
}

interface TimeDialogData {
  meetingId: number;
  date: string;
  timeSlot: string;
}

interface Schedule {
  date: string;
  timeSlot: string;
  meetingName: string;
  meetingImage: string;
  priority: number;
  notes: string;
}

const MeetingScheduler = () => {
const [meetings, setMeetings] = useState<Meeting[]>([]);
const [showForm, setShowForm] = useState(false);
const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
const [showImportDialog, setShowImportDialog] = useState(false);
const [showTimeDialog, setShowTimeDialog] = useState(false);
const [timeDialogData, setTimeDialogData] = useState<TimeDialogData | null>(null);
const [showNotificationDialog, setShowNotificationDialog] = useState(false);
const [notificationTimes, setNotificationTimes] = useState([60, 30]); // デフォルト: 1時間前、30分前
const [theme, setTheme] = useState<'light' | 'dark'>('light');
const [formData, setFormData] = useState<FormData>({
  name: '',
  image: '',
  notes: '',
  preferredOptions: [
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' }
  ]
});
const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

const timeSlots = [
  { value: 'allday', label: '終日' },
  { value: 'morning', label: '10:00 ~ 12:00' },
  { value: 'afternoon', label: '13:00 ~ 16:00' },
  { value: 'evening', label: '17:00以降' }
];

// localStorageからデータを読み込む
useEffect(() => {
  const savedMeetings = localStorage.getItem('meetingSchedulerData');
  if (savedMeetings) {
    try {
      setMeetings(JSON.parse(savedMeetings));
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  }

  // テーマ設定を読み込む
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    setTheme(savedTheme);
  }
}, []);

// テーマ管理のuseEffect
useEffect(() => {
  const html = document.documentElement;
  
  // 既存のクラスをクリア
  html.classList.remove('dark', 'light');
  
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.add('light');
  }
  
  localStorage.setItem('theme', theme);
}, [theme]);

// meetingsが変更されたらlocalStorageに保存
useEffect(() => {
  localStorage.setItem('meetingSchedulerData', JSON.stringify(meetings));
}, [meetings]);

// 自動バリデーション
useEffect(() => {
  const errors: ValidationErrors = {};
  
  if (!formData.name.trim()) {
    errors.name = '名前は必須です';
  }
  
  for (let i = 0; i < 3; i++) {
    if (!formData.preferredOptions[i].date) {
      errors[`date_${i}`] = `第${i + 1}希望の日程は必須です`;
    }
    if (!formData.preferredOptions[i].timeSlot) {
      errors[`timeSlot_${i}`] = `第${i + 1}希望の時間帯は必須です`;
    }
  }
  
  setValidationErrors(errors);
}, [formData]);

const addMeeting = () => {
  if (Object.keys(validationErrors).length > 0) {
    alert('入力内容に不備があります。赤い項目を確認してください。');
    return;
  }

  if (editingMeeting) {
    // 編集モード
    setMeetings(meetings.map(meeting => 
      meeting.id === editingMeeting.id 
        ? {
            ...editingMeeting,
            name: formData.name,
            image: formData.image,
            notes: formData.notes,
            preferredOptions: formData.preferredOptions.filter(option => option.date && option.timeSlot),
            confirmedDate: editingMeeting.confirmedDate || '',
            confirmedTimeSlot: editingMeeting.confirmedTimeSlot || '',
            confirmedStartTime: editingMeeting.confirmedStartTime || '',
            confirmedEndTime: editingMeeting.confirmedEndTime || ''
          }
        : meeting
    ));
    setEditingMeeting(null);
  } else {
    // 新規追加モード
    const newMeeting: Meeting = {
      id: Date.now(),
      name: formData.name,
      image: formData.image,
      notes: formData.notes,
      preferredOptions: formData.preferredOptions.filter(option => option.date && option.timeSlot),
      confirmedDate: '',
      confirmedTimeSlot: '',
      confirmedStartTime: '',
      confirmedEndTime: '',
      status: 'pending'
    };
    setMeetings([...meetings, newMeeting]);
  }

  setFormData({
    name: '',
    image: '',
    notes: '',
    preferredOptions: [
      { date: '', timeSlot: '' },
      { date: '', timeSlot: '' },
      { date: '', timeSlot: '' },
      { date: '', timeSlot: '' },
      { date: '', timeSlot: '' }
    ]
  });
  setShowForm(false);
};

const editMeeting = (meeting: Meeting) => {
  setEditingMeeting(meeting);
  setFormData({
    name: meeting.name,
    image: meeting.image,
    notes: meeting.notes,
    preferredOptions: [
      ...meeting.preferredOptions,
      ...Array(5 - meeting.preferredOptions.length).fill({ date: '', timeSlot: '' })
    ].slice(0, 5)
  });
  setShowForm(true);
};

const deleteMeeting = (id: number) => {
  setMeetings(meetings.filter(meeting => meeting.id !== id));
};

const confirmMeeting = (meetingId: number, date: string, timeSlot: string) => {
  setTimeDialogData({ meetingId, date, timeSlot });
  setShowTimeDialog(true);
};

const finalizeConfirmation = (startTime: string, endTime: string) => {
  if (!timeDialogData) return;
  
  const { meetingId, date, timeSlot } = timeDialogData;
  setMeetings(meetings.map(meeting => 
    meeting.id === meetingId 
      ? { 
          ...meeting, 
          confirmedDate: date, 
          confirmedTimeSlot: timeSlot,
          confirmedStartTime: startTime,
          confirmedEndTime: endTime,
          status: 'confirmed' as const
        }
      : meeting
  ));
  setShowTimeDialog(false);
  setTimeDialogData(null);
};

const resetConfirmation = (meetingId: number) => {
  setMeetings(meetings.map(meeting => 
    meeting.id === meetingId 
      ? { 
          ...meeting, 
          confirmedDate: '', 
          confirmedTimeSlot: '', 
          confirmedStartTime: '',
          confirmedEndTime: '',
          status: 'pending' as const
        }
      : meeting
  ));
};

// icsファイル生成
const generateIcsFile = (meeting: Meeting) => {
  if (!meeting.confirmedDate || !meeting.confirmedStartTime || !meeting.confirmedEndTime) return;

  const date = new Date(meeting.confirmedDate);
  const [startHour, startMinute] = meeting.confirmedStartTime.split(':').map(Number);
  const [endHour, endMinute] = meeting.confirmedEndTime.split(':').map(Number);
  
  const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute);
  const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinute);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = new Date();
  const alarms = notificationTimes.map(minutes => 
    `BEGIN:VALARM\r\nTRIGGER:-PT${minutes}M\r\nACTION:DISPLAY\r\nDESCRIPTION:面談開始${minutes}分前\r\nEND:VALARM`
  ).join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meeting Scheduler//Meeting Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${meeting.id}-${now.getTime()}@meetingscheduler.com`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:面談 - ${meeting.name}`,
    `DESCRIPTION:${meeting.notes ? meeting.notes.replace(/\n/g, '\\n') : '面談の予定'}`,
    'STATUS:CONFIRMED',
    alarms,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `面談_${meeting.name}_${meeting.confirmedDate}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 占有されている日時をチェック（現在編集中の面談を除く）
const isSlotOccupied = (date: string, timeSlot: string, optionIndex: number = -1) => {
  if (!date || !timeSlot) return false;
  
  // 既存の面談をチェック（編集中の面談は除外）
  for (let meeting of meetings) {
    if (editingMeeting && meeting.id === editingMeeting.id) continue;
    
    for (let option of meeting.preferredOptions) {
      if (option.date === date) {
        if (option.timeSlot === 'allday' || timeSlot === 'allday' || option.timeSlot === timeSlot) {
          return true;
        }
      }
    }
  }

  // 現在のフォーム内の他のオプションをチェック
  for (let i = 0; i < formData.preferredOptions.length; i++) {
    if (i !== optionIndex) {
      const option = formData.preferredOptions[i];
      if (option.date === date && option.timeSlot) {
        if (option.timeSlot === 'allday' || timeSlot === 'allday' || option.timeSlot === timeSlot) {
          return true;
        }
      }
    }
  }

  return false;
};

const getTimeSlotLabel = (value: string) => {
  return timeSlots.find(slot => slot.value === value)?.label || value;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  });
};

const formatDateShort = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  });
};

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setFormData({...formData, image: result});
      }
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  setFormData({...formData, image: ''});
};

const updatePreferredOption = (index: number, field: keyof PreferredOption, value: string) => {
  const newOptions = [...formData.preferredOptions];
  newOptions[index] = { ...newOptions[index], [field]: value };
  setFormData({...formData, preferredOptions: newOptions});
};

const isRequired = (index: number) => index < 3;

// 今日の日付を取得（YYYY-MM-DD形式）
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 予定サマリーの生成
const generateScheduleSummary = (): { [key: string]: Schedule[] } => {
  const allSchedules: Schedule[] = [];
  
  meetings.forEach(meeting => {
    meeting.preferredOptions.forEach((option, index) => {
      if (option.date && option.timeSlot) {
        allSchedules.push({
          date: option.date,
          timeSlot: option.timeSlot,
          meetingName: meeting.name,
          meetingImage: meeting.image,
          priority: index + 1,
          notes: meeting.notes
        });
      }
    });
  });

  // 日付順にソート
  allSchedules.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 日付別にグループ化
  const groupedByDate: { [key: string]: Schedule[] } = {};
  allSchedules.forEach(schedule => {
    if (!groupedByDate[schedule.date]) {
      groupedByDate[schedule.date] = [];
    }
    groupedByDate[schedule.date].push(schedule);
  });

  return groupedByDate;
};

const scheduleSummary = generateScheduleSummary();

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
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
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
          onClick={() => {
            setEditingMeeting(null);
            setFormData({
              name: '',
              image: '',
              notes: '',
              preferredOptions: [
                { date: '', timeSlot: '' },
                { date: '', timeSlot: '' },
                { date: '', timeSlot: '' },
                { date: '', timeSlot: '' },
                { date: '', timeSlot: '' }
              ]
            });
            setShowForm(!showForm);
          }}
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
                setTimeDialogData(null);
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
            希望日程と時間帯（第1〜第3希望は必須）
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
                      const isOccupied = isSlotOccupied(option.date, slot.value, index);
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
                  {option.date && option.timeSlot && isSlotOccupied(option.date, option.timeSlot, index) && (
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
            onClick={() => {
              setShowForm(false);
              setEditingMeeting(null);
              setFormData({
                name: '',
                image: '',
                notes: '',
                preferredOptions: [
                  { date: '', timeSlot: '' },
                  { date: '', timeSlot: '' },
                  { date: '', timeSlot: '' },
                  { date: '', timeSlot: '' },
                  { date: '', timeSlot: '' }
                ]
              });
            }}
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
                      onClick={() => generateIcsFile(meeting)}
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
  </div>
);
};

export default MeetingScheduler;
