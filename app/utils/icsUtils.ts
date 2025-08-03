import type { Meeting } from '~/types/meeting';
import { formatIcsDate } from './dateUtils';

/**
 * 面談情報からICSファイルを生成してダウンロードします
 * @param meeting 面談情報オブジェクト
 * @param notificationTimes 通知時刻の配列（分単位）
 * @returns void ファイルのダウンロードを実行
 * @example
 * generateIcsFile(meeting, [60, 30]) // 1時間前と30分前に通知
 */
export const generateIcsFile = (meeting: Meeting, notificationTimes: number[]) => {
  if (!meeting.confirmedDate || !meeting.confirmedStartTime || !meeting.confirmedEndTime) return;

  const date = new Date(meeting.confirmedDate);
  const [startHour, startMinute] = meeting.confirmedStartTime.split(':').map(Number);
  const [endHour, endMinute] = meeting.confirmedEndTime.split(':').map(Number);
  
  const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute);
  const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinute);

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
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(startTime)}`,
    `DTEND:${formatIcsDate(endTime)}`,
    `SUMMARY:${(meeting.meetingType || 'offline') === 'online' ? '[オンライン] ' : '[対面] '}面談 ${meeting.name}`,
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

/**
 * 確定済みの複数の面談をまとめて1つのICSファイルとしてエクスポートします
 * @param meetings 確定済みの面談情報配列
 * @param notificationTimes 通知時刻の配列（分単位）
 * @returns void ファイルのダウンロードを実行
 * @example
 * generateUnifiedIcsFile(confirmedMeetings, [60, 30]) // 1時間前と30分前に通知
 */
export const generateUnifiedIcsFile = (meetings: Meeting[], notificationTimes: number[]) => {
  const confirmedMeetings = meetings.filter(m => 
    m.status === 'confirmed' && 
    m.confirmedDate && 
    m.confirmedStartTime && 
    m.confirmedEndTime
  );

  if (confirmedMeetings.length === 0) {
    console.warn('確定済みの面談がありません');
    return;
  }

  const now = new Date();
  const events = confirmedMeetings.map(meeting => {
    const date = new Date(meeting.confirmedDate!);
    const [startHour, startMinute] = meeting.confirmedStartTime!.split(':').map(Number);
    const [endHour, endMinute] = meeting.confirmedEndTime!.split(':').map(Number);
    
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinute);

    const alarms = notificationTimes.map(minutes => 
      `BEGIN:VALARM\r\nTRIGGER:-PT${minutes}M\r\nACTION:DISPLAY\r\nDESCRIPTION:面談開始${minutes}分前\r\nEND:VALARM`
    ).join('\r\n');

    return [
      'BEGIN:VEVENT',
      `UID:${meeting.id}-${now.getTime()}@meetingscheduler.com`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(startTime)}`,
      `DTEND:${formatIcsDate(endTime)}`,
      `SUMMARY:${(meeting.meetingType || 'offline') === 'online' ? '[オンライン] ' : '[対面] '}面談 ${meeting.name}`,
      `DESCRIPTION:${meeting.notes ? meeting.notes.replace(/\n/g, '\\n') : '面談の予定'}`,
      'STATUS:CONFIRMED',
      alarms,
      'END:VEVENT'
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meeting Scheduler//Meeting Calendar//EN',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // ファイル名に日付範囲を含める
  const dates = confirmedMeetings.map(m => m.confirmedDate!).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const dateRange = startDate === endDate ? startDate : `${startDate}_${endDate}`;
  
  link.download = `確定面談一覧_${dateRange}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * ICSファイルの内容を解析して面談情報の配列を返します
 * @param icsContent ICSファイルのテキスト内容
 * @returns 解析された面談情報の部分的なオブジェクトの配列
 * @example
 * parseIcsFile(icsContent) // → [{ name: '田中太郎', confirmedDate: '2024-01-15', ... }]
 */
export const parseIcsFile = (icsContent: string): Partial<Meeting>[] => {
  const events: Partial<Meeting>[] = [];
  const lines = icsContent.split(/\r?\n/);
  let currentEvent: Partial<Meeting> | null = null;
  let isInEvent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'BEGIN:VEVENT') {
      isInEvent = true;
      currentEvent = {
        id: Date.now() + Math.random(),
        name: '',
        image: '',
        notes: '',
        preferredOptions: [],
        confirmedDate: '',
        confirmedTimeSlot: '',
        confirmedStartTime: '',
        confirmedEndTime: '',
        status: 'pending'
      };
    } else if (line === 'END:VEVENT' && currentEvent) {
      isInEvent = false;
      if (currentEvent.name) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (isInEvent && currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        const summary = line.substring(8);
        currentEvent.name = summary.replace(/^面談\s*-\s*/, '') || summary;
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.notes = line.substring(12).replace(/\\n/g, '\n');
      } else if (line.startsWith('DTSTART:')) {
        const dateTimeStr = line.substring(8);
        try {
          const dateTime = parseIcsDateTime(dateTimeStr);
          if (dateTime) {
            currentEvent.confirmedDate = dateTime.toISOString().split('T')[0];
            currentEvent.confirmedStartTime = dateTime.toTimeString().substring(0, 5);
            
            const hour = dateTime.getHours();
            if (hour >= 10 && hour < 12) {
              currentEvent.confirmedTimeSlot = 'morning';
            } else if (hour >= 13 && hour < 16) {
              currentEvent.confirmedTimeSlot = 'afternoon';
            } else if (hour >= 17) {
              currentEvent.confirmedTimeSlot = 'evening';
            } else {
              currentEvent.confirmedTimeSlot = 'allday';
            }
          }
        } catch (error) {
          console.error('日時の解析に失敗しました:', error);
        }
      } else if (line.startsWith('DTEND:')) {
        const dateTimeStr = line.substring(6);
        try {
          const dateTime = parseIcsDateTime(dateTimeStr);
          if (dateTime) {
            currentEvent.confirmedEndTime = dateTime.toTimeString().substring(0, 5);
          }
        } catch (error) {
          console.error('終了時刻の解析に失敗しました:', error);
        }
      }
    }
  }

  return events;
};

/**
 * ICSフォーマットの日時文字列をDateオブジェクトに変換します
 * @param dateTimeStr ICS形式の日時文字列（YYYYMMDDTHHMMSSZまたはYYYYMMDD）
 * @returns 変換されたDateオブジェクト、解析できない場合はnull
 * @example
 * parseIcsDateTime('20240115T103000Z') // → Dateオブジェクト
 * parseIcsDateTime('20240115') // → Dateオブジェクト
 * parseIcsDateTime('invalid') // → null
 */
export const parseIcsDateTime = (dateTimeStr: string): Date | null => {
  try {
    if (dateTimeStr.endsWith('Z')) {
      const cleanStr = dateTimeStr.slice(0, -1);
      const year = parseInt(cleanStr.substring(0, 4));
      const month = parseInt(cleanStr.substring(4, 6)) - 1;
      const day = parseInt(cleanStr.substring(6, 8));
      const hour = parseInt(cleanStr.substring(9, 11));
      const minute = parseInt(cleanStr.substring(11, 13));
      const second = parseInt(cleanStr.substring(13, 15));
      
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    
    if (dateTimeStr.length === 8) {
      const year = parseInt(dateTimeStr.substring(0, 4));
      const month = parseInt(dateTimeStr.substring(4, 6)) - 1;
      const day = parseInt(dateTimeStr.substring(6, 8));
      
      return new Date(year, month, day);
    }
    
    return null;
  } catch (error) {
    console.error('日時解析エラー:', error);
    return null;
  }
};