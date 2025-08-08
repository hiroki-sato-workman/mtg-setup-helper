import { useState } from 'react';
import type { Meeting } from '~/types/meeting';

/**
 * デモモード用のサンプルデータ
 */
const DEMO_DATA: Meeting[] = [
  {
    id: 1,
    name: '田中太郎',
    image: '',
    notes: 'プロダクトマネージャーとしての経験豊富。スクラムマスター資格保有。',
    meetingType: 'offline',
    meetingLocation: '東京オフィス 会議室A',
    preferredOptions: [
      { date: '2025-08-15', timeSlot: 'morning' },
      { date: '2025-08-16', timeSlot: 'afternoon' },
      { date: '2025-08-20', timeSlot: 'morning' }
    ],
    confirmedDate: '2025-08-15',
    confirmedTimeSlot: 'morning',
    confirmedStartTime: '10:00',
    confirmedEndTime: '11:00',
    status: 'confirmed',
    meetingResult: '非常に優秀な候補者でした。技術的な知識も豊富で、チームワークも良好です。ぜひ一緒に働きたいと思える人材でした。'
  },
  {
    id: 2,
    name: '佐藤花子',
    image: '',
    notes: 'フロントエンド開発5年経験。React、TypeScript得意。',
    meetingType: 'online',
    meetingLocation: 'Zoom（URLは別途送信）',
    preferredOptions: [
      { date: '2025-08-14', timeSlot: 'evening' },
      { date: '2025-08-15', timeSlot: 'afternoon' },
      { date: '2025-08-19', timeSlot: 'evening' }
    ],
    confirmedDate: '',
    confirmedTimeSlot: '',
    confirmedStartTime: '',
    confirmedEndTime: '',
    status: 'pending',
    meetingResult: ''
  },
  {
    id: 3,
    name: '山田次郎',
    image: '',
    notes: 'バックエンドエンジニア。Go、Python、AWSクラウド経験あり。',
    meetingType: 'offline',
    meetingLocation: '大阪支社 会議室B',
    preferredOptions: [
      { date: '2025-08-16', timeSlot: 'morning' },
      { date: '2025-08-17', timeSlot: 'allday' },
      { date: '2025-08-21', timeSlot: 'afternoon' }
    ],
    confirmedDate: '',
    confirmedTimeSlot: '',
    confirmedStartTime: '',
    confirmedEndTime: '',
    status: 'pending',
    meetingResult: ''
  },
  {
    id: 4,
    name: '鈴木美咲',
    image: '',
    notes: 'デザイナー兼フロントエンドエンジニア。UI/UX設計からコーディングまで対応可能。',
    meetingType: 'online',
    meetingLocation: 'Google Meet',
    preferredOptions: [
      { date: '2025-08-15', timeSlot: 'morning' },
      { date: '2025-08-15', timeSlot: 'afternoon' },
      { date: '2025-08-18', timeSlot: 'evening' }
    ],
    confirmedDate: '2025-08-18',
    confirmedTimeSlot: 'evening',
    confirmedStartTime: '19:00',
    confirmedEndTime: '20:30',
    status: 'confirmed',
    meetingResult: '創造力が豊かで、技術スキルも高い候補者でした。デザインセンスが優秀で、エンジニアリングスキルとのバランスが取れています。'
  },
  {
    id: 5,
    name: '高橋和也',
    image: '',
    notes: 'データサイエンティスト。機械学習、統計解析の専門家。日程調整中のため未定。',
    meetingType: 'offline',
    meetingLocation: '東京オフィス 会議室C',
    preferredOptions: [],
    confirmedDate: '',
    confirmedTimeSlot: '',
    confirmedStartTime: '',
    confirmedEndTime: '',
    status: 'pending',
    meetingResult: ''
  },
  {
    id: 6,
    name: '中村翔太',
    image: '',
    notes: 'インフラエンジニア。Docker、Kubernetes、CI/CD経験豊富。',
    meetingType: 'online',
    meetingLocation: 'Microsoft Teams',
    preferredOptions: [
      { date: '2025-08-16', timeSlot: 'afternoon' },
      { date: '2025-08-17', timeSlot: 'morning' },
      { date: '2025-08-19', timeSlot: 'morning' }
    ],
    confirmedDate: '',
    confirmedTimeSlot: '',
    confirmedStartTime: '',
    confirmedEndTime: '',
    status: 'pending',
    meetingResult: ''
  },
  {
    id: 7,
    name: '伊藤あかり',
    image: '',
    notes: 'QAエンジニア。テスト自動化とCI/CD導入の経験あり。海外在住のため時差を考慮した調整が必要。',
    meetingType: 'online',
    meetingLocation: 'Zoom（時差調整要）',
    preferredOptions: [],
    confirmedDate: '',
    confirmedTimeSlot: '',
    confirmedStartTime: '',
    confirmedEndTime: '',
    status: 'pending',
    meetingResult: ''
  }
];

/**
 * デモモード管理用のカスタムフック
 */
export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const getDemoData = (): Meeting[] => {
    return DEMO_DATA;
  };

  return {
    isDemoMode,
    toggleDemoMode,
    getDemoData
  };
};