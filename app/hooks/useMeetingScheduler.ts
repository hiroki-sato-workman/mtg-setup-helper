import { useState, useEffect } from 'react';
import type { Meeting, FormData, ValidationErrors, TimeDialogData, Toast } from '~/types/meeting';
import { validateForm, createEmptyFormData } from '~/utils/scheduleUtils';
import { parseIcsFile } from '~/utils/icsUtils';

/**
 * 面談スケジューラーの状態管理とビジネスロジックを提供するカスタムフック
 * @returns 面談管理に必要な状態、アクション、セッター関数
 * @example
 * const { meetings, addMeeting, editMeeting, ... } = useMeetingScheduler();
 */
export const useMeetingScheduler = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [timeDialogData, setTimeDialogData] = useState<TimeDialogData | null>(null);
  const [notificationTimes, setNotificationTimes] = useState([60, 30]);
  const [formData, setFormData] = useState<FormData>(createEmptyFormData());
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const savedMeetings = localStorage.getItem('meetingSchedulerData');
    if (savedMeetings) {
      try {
        setMeetings(JSON.parse(savedMeetings));
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('meetingSchedulerData', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    setValidationErrors(validateForm(formData));
  }, [formData]);

  const addMeeting = () => {
    if (Object.keys(validationErrors).length > 0) {
      alert('入力内容に不備があります。赤い項目を確認してください。');
      return;
    }

    if (editingMeeting) {
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
      const newMeeting: Meeting = {
        id: Date.now(),
        name: formData.name,
        image: formData.image,
        notes: formData.notes,
        meetingType: formData.meetingType || 'offline',
        preferredOptions: formData.preferredOptions.filter(option => option.date && option.timeSlot),
        confirmedDate: '',
        confirmedTimeSlot: '',
        confirmedStartTime: '',
        confirmedEndTime: '',
        status: 'pending'
      };
      setMeetings([...meetings, newMeeting]);
    }

    setFormData(createEmptyFormData());
    setShowForm(false);
  };

  const editMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      name: meeting.name,
      image: meeting.image,
      notes: meeting.notes,
      meetingType: meeting.meetingType || 'offline',
      preferredOptions: [
        ...meeting.preferredOptions,
        ...Array(5 - meeting.preferredOptions.length).fill({ date: '', timeSlot: '' })
      ].slice(0, 5)
    });
    setShowForm(true);
  };

  const startInlineEdit = (meetingId: number) => {
    setInlineEditingId(meetingId);
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const saveInlineEdit = (meetingId: number, updatedMeeting: Partial<Meeting>) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, ...updatedMeeting }
        : meeting
    ));
    setInlineEditingId(null);
    showToast('面談情報を更新しました。', 'success');
  };

  const updateInlineMeetingField = (meetingId: number, field: keyof Meeting, value: any) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, [field]: value }
        : meeting
    ));
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

  const handleIcsImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedEvents = parseIcsFile(content);
        
        if (importedEvents.length === 0) {
          showToast('有効なイベントが見つかりませんでした。', 'error');
          return;
        }

        const newMeetings: Meeting[] = importedEvents.map(event => ({
          id: Date.now() + Math.random(),
          name: event.name || '無題の面談',
          image: event.image || '',
          notes: event.notes || '',
          meetingType: 'offline', // ICSインポート時はデフォルトで対面
          preferredOptions: event.confirmedDate && event.confirmedTimeSlot ? 
            [{ date: event.confirmedDate, timeSlot: event.confirmedTimeSlot }] : [],
          confirmedDate: event.confirmedDate || '',
          confirmedTimeSlot: event.confirmedTimeSlot || '',
          confirmedStartTime: event.confirmedStartTime || '',
          confirmedEndTime: event.confirmedEndTime || '',
          status: (event.confirmedDate && event.confirmedStartTime && event.confirmedEndTime) ? 'confirmed' : 'pending'
        }));

        setMeetings(prevMeetings => [...prevMeetings, ...newMeetings]);
        setShowImportDialog(false);
        
        showToast(`${newMeetings.length}件の面談をインポートしました。`, 'success');
      } catch (error) {
        console.error('ファイルの読み込みに失敗しました:', error);
        showToast('ファイルの読み込みに失敗しました。正しいicsファイルを選択してください。', 'error');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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

  const updatePreferredOption = (index: number, field: keyof import('~/types/meeting').PreferredOption, value: string) => {
    const newOptions = [...formData.preferredOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({...formData, preferredOptions: newOptions});
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMeeting(null);
    setFormData(createEmptyFormData());
  };

  const openNewMeetingForm = () => {
    setEditingMeeting(null);
    setFormData(createEmptyFormData());
    setShowForm(!showForm);
  };

  return {
    // State
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
    
    // Actions
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
    showToast,
    removeToast,
    handleImageUpload,
    removeImage,
    updatePreferredOption,
    resetForm,
    openNewMeetingForm,
    
    // Setters
    setShowImportDialog,
    setShowTimeDialog,
    setFormData
  };
};
