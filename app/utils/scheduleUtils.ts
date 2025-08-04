import type { Meeting, Schedule, ValidationErrors, FormData, TimeSlot } from '~/types/meeting';

/**
 * 利用可能な時間帯の定義
 */
export const timeSlots: TimeSlot[] = [
  { value: 'allday', label: '終日' },
  { value: 'separator1', label: '──────────', disabled: true },
  { value: 'morning', label: '10:00 ~ 12:00' },
  { value: 'afternoon', label: '13:00 ~ 16:00' },
  { value: 'evening', label: '17:00以降' },
  { value: 'separator2', label: '──────────', disabled: true },
  { value: '10-11', label: '10:00 ~ 11:00' },
  { value: '11-12', label: '11:00 ~ 12:00' },
  { value: '12-13', label: '12:00 ~ 13:00' },
  { value: '13-14', label: '13:00 ~ 14:00' },
  { value: '14-15', label: '14:00 ~ 15:00' },
  { value: '15-16', label: '15:00 ~ 16:00' },
  { value: '16-17', label: '16:00 ~ 17:00' },
  { value: '17-18', label: '17:00 ~ 18:00' },
  { value: '18-19', label: '18:00 ~ 19:00' }
];

/**
 * 時間帯のvalueから表示ラベルを取得します
 * @param value 時間帯のvalue（'morning', 'afternoon', 'evening', 'allday'）
 * @returns 表示用ラベル、見つからない場合は元のvalueを返す
 * @example
 * getTimeSlotLabel('morning') // → "10:00 ~ 12:00"
 * getTimeSlotLabel('unknown') // → "unknown"
 */
export const getTimeSlotLabel = (value: string) => {
  return timeSlots.find(slot => slot.value === value)?.label || value;
};

/**
 * 面談一覧から日付別のスケジュールサマリーを生成します
 * @param meetings 面談情報の配列
 * @returns 日付をキーとしたスケジュール情報のオブジェクト
 * @example
 * generateScheduleSummary(meetings) // → { '2024-01-15': [{ date: '2024-01-15', meetingName: '田中太郎', ... }] }
 */
export const generateScheduleSummary = (meetings: Meeting[]): { [key: string]: Schedule[] } => {
  const allSchedules: Schedule[] = [];
  
  meetings.forEach(meeting => {
    // 確定済み面談の場合は希望予定を含めない
    if (meeting.status === 'confirmed') {
      return;
    }
    
    meeting.preferredOptions.forEach((option, index) => {
      if (option.date && option.timeSlot) {
        allSchedules.push({
          date: option.date,
          timeSlot: option.timeSlot,
          meetingName: meeting.name,
          meetingImage: meeting.image,
          priority: index + 1,
          notes: meeting.notes,
          meetingType: meeting.meetingType
        });
      }
    });
  });

  allSchedules.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupedByDate: { [key: string]: Schedule[] } = {};
  allSchedules.forEach(schedule => {
    if (!groupedByDate[schedule.date]) {
      groupedByDate[schedule.date] = [];
    }
    groupedByDate[schedule.date].push(schedule);
  });

  return groupedByDate;
};

/**
 * 時間帯の開始・終了時刻を取得します
 * @param timeSlot 時間帯の値
 * @returns [開始時刻, 終了時刻] の配列、該当なしの場合は null
 */
const getTimeSlotRange = (timeSlot: string): [number, number] | null => {
  if (timeSlot === 'allday') return [0, 24];
  if (timeSlot === 'morning') return [10, 12];
  if (timeSlot === 'afternoon') return [13, 16];
  if (timeSlot === 'evening') return [17, 24];
  
  // 1時間単位の時間帯（例：'11-12', '13-14'）
  if (timeSlot.includes('-')) {
    const [start, end] = timeSlot.split('-').map(Number);
    if (!isNaN(start) && !isNaN(end)) {
      return [start, end];
    }
  }
  
  return null;
};

/**
 * 2つの時間帯が重複しているかチェックします
 * @param timeSlot1 時間帯1
 * @param timeSlot2 時間帯2
 * @returns 重複している場合は true
 */
const isTimeSlotOverlapping = (timeSlot1: string, timeSlot2: string): boolean => {
  if (timeSlot1 === 'allday' || timeSlot2 === 'allday') return true;
  if (timeSlot1 === timeSlot2) return true;
  
  const range1 = getTimeSlotRange(timeSlot1);
  const range2 = getTimeSlotRange(timeSlot2);
  
  if (!range1 || !range2) return false;
  
  const [start1, end1] = range1;
  const [start2, end2] = range2;
  
  // 時間範囲の重複チェック
  return start1 < end2 && start2 < end1;
};

/**
 * 指定された日時が他の面談と重複しているかチェックします
 * @param date チェックする日付（YYYY-MM-DD形式）
 * @param timeSlot チェックする時間帯
 * @param meetings 現在の面談一覧
 * @param editingMeeting 編集中の面談（チェックから除外）
 * @param formData 現在のフォームデータ
 * @param optionIndex チェックするオプションのインデックス（フォーム内重複チェック用）
 * @returns 重複している場合はtrue
 * @example
 * isSlotOccupied('2024-01-15', 'morning', meetings, null, formData, 0) // → true/false
 */
export const isSlotOccupied = (
  date: string, 
  timeSlot: string, 
  meetings: Meeting[], 
  editingMeeting: Meeting | null, 
  formData: FormData, 
  optionIndex: number = -1
) => {
  if (!date || !timeSlot) return false;
  
  for (let meeting of meetings) {
    if (editingMeeting && meeting.id === editingMeeting.id) continue;
    
    for (let option of meeting.preferredOptions) {
      if (option.date === date && option.timeSlot) {
        if (isTimeSlotOverlapping(timeSlot, option.timeSlot)) {
          return true;
        }
      }
    }
  }

  for (let i = 0; i < formData.preferredOptions.length; i++) {
    if (i !== optionIndex) {
      const option = formData.preferredOptions[i];
      if (option.date === date && option.timeSlot) {
        if (isTimeSlotOverlapping(timeSlot, option.timeSlot)) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * フォームデータのバリデーションを実行します
 * @param formData 検証するフォームデータ
 * @returns エラー情報のオブジェクト（エラーがない場合は空オブジェクト）
 * @example
 * validateForm(formData) // → { name: '名前は必須です' } または {}
 */
export const validateForm = (formData: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!formData.name.trim()) {
    errors.name = '名前は必須です';
  }
  
  if (!formData.preferredOptions[0].date) {
    errors[`date_0`] = `第1希望の日程は必須です`;
  }
  if (!formData.preferredOptions[0].timeSlot) {
    errors[`timeSlot_0`] = `第1希望の時間帯は必須です`;
  }
  
  return errors;
};

/**
 * 指定されたインデックスの項目が必須かどうかを判定します
 * @param index チェックする項目のインデックス（0始まり）
 * @returns 必須の場合はtrue（現在は第1希望のみ必須）
 * @example
 * isRequired(0) // → true（第1希望は必須）
 * isRequired(1) // → false（第2希望以降は任意）
 */
export const isRequired = (index: number) => index < 1;

/**
 * 空のフォームデータオブジェクトを作成します
 * @returns 初期化されたフォームデータ
 * @example
 * createEmptyFormData() // → { name: '', image: '', notes: '', preferredOptions: [...] }
 */
export const createEmptyFormData = (): FormData => ({
  name: '',
  image: '',
  notes: '',
  meetingType: 'offline',
  preferredOptions: [
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' },
    { date: '', timeSlot: '' }
  ]
});

/**
 * 時間帯から開始・終了時刻のデフォルト値を取得します
 * @param timeSlot 時間帯の値
 * @returns [開始時刻, 終了時刻] の文字列配列（HH:MM形式）
 * @example
 * getDefaultTimeFromSlot('morning') // → ['10:00', '12:00']
 * getDefaultTimeFromSlot('13-14') // → ['13:00', '14:00']
 */
export const getDefaultTimeFromSlot = (timeSlot: string): [string, string] => {
  if (timeSlot === 'morning') return ['10:00', '12:00'];
  if (timeSlot === 'afternoon') return ['13:00', '16:00'];
  if (timeSlot === 'evening') return ['17:00', '19:00'];
  if (timeSlot === 'allday') return ['09:00', '18:00'];
  
  // 1時間単位の時間帯（例：'11-12', '13-14'）
  if (timeSlot.includes('-')) {
    const [start, end] = timeSlot.split('-').map(Number);
    if (!isNaN(start) && !isNaN(end)) {
      const startTime = `${start.toString().padStart(2, '0')}:00`;
      const endTime = `${end.toString().padStart(2, '0')}:00`;
      return [startTime, endTime];
    }
  }
  
  // デフォルト値
  return ['10:00', '11:00'];
};

/**
 * 確定面談をフィルタリング・ソートして表示用リストを生成します
 * @param meetings 面談情報の配列
 * @param currentTime 現在時刻（テスト用、省略時は現在時刻を使用）
 * @returns フィルタリング・ソート済みの確定面談配列
 * @example
 * const confirmedMeetings = getFilteredConfirmedMeetings(meetings);
 */
export const getFilteredConfirmedMeetings = (meetings: Meeting[], currentTime?: Date): Meeting[] => {
  const now = currentTime || new Date();
  
  return meetings
    .filter(m => m.status === 'confirmed' && m.confirmedDate)
    .filter(m => {
      // 予定日を1時間過ぎた場合は非表示
      const meetingDate = new Date(m.confirmedDate!);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const meetingDateOnly = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
      
      // 未来の日付の場合は常に表示
      if (meetingDateOnly > today) return true;
      
      // 過去の日付の場合は非表示
      if (meetingDateOnly < today) return false;
      
      // 時刻が設定されていない場合は今日の終わりまで表示
      if (!m.confirmedStartTime) return true;
      // 今日の場合のみ時刻チェック
      const [hour, minute] = m.confirmedStartTime.split(':').map(Number);
      meetingDate.setHours(hour, minute, 0, 0);
      // 開始時刻から1時間経過したら非表示
      const oneHourAfterStart = new Date(meetingDate.getTime() + 60 * 60 * 1000);
      return now < oneHourAfterStart;        
    })
    .sort((a, b) => {
      // 日時の古い順（昇順）にソート
      const dateA = new Date(a.confirmedDate!);
      const dateB = new Date(b.confirmedDate!);
      
      if (a.confirmedStartTime) {
        const [hourA, minuteA] = a.confirmedStartTime.split(':').map(Number);
        dateA.setHours(hourA, minuteA, 0, 0);
      }
      if (b.confirmedStartTime) {
        const [hourB, minuteB] = b.confirmedStartTime.split(':').map(Number);
        dateB.setHours(hourB, minuteB, 0, 0);
      }
      
      return dateA.getTime() - dateB.getTime();
    });
};