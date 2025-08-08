import { useState, useEffect } from 'react';
import type { Meeting, FormData, ValidationErrors, TimeDialogData, Toast } from '~/types/meeting';
import { validateForm, createEmptyFormData } from '~/utils/scheduleUtils';
import { parseIcsFile } from '~/utils/icsUtils';
import { exportMeetingData, importMeetingData } from '~/utils/dataUtils';
import { useDemoMode } from './useDemoMode';

/**
 * 面談スケジューラーの状態管理とビジネスロジックを提供するカスタムフック
 * @returns 面談管理に必要な状態、アクション、セッター関数
 * @example
 * const { meetings, addMeeting, editMeeting, ... } = useMeetingScheduler();
 */
export const useMeetingScheduler = () => {
  const { isDemoMode, toggleDemoMode, getDemoData } = useDemoMode();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [inlineEditingData, setInlineEditingData] = useState<Meeting | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [timeDialogData, setTimeDialogData] = useState<TimeDialogData | null>(null);
  const [notificationTimes, setNotificationTimes] = useState([60, 30]);
  const [formData, setFormData] = useState<FormData>(createEmptyFormData());
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setMeetings(getDemoData());
    } else {
      const savedMeetings = localStorage.getItem('meetingSchedulerData');
      if (savedMeetings) {
        try {
          setMeetings(JSON.parse(savedMeetings));
        } catch (error) {
          console.error('データの読み込みに失敗しました:', error);
        }
      }
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem('meetingSchedulerData', JSON.stringify(meetings));
    }
  }, [meetings, isDemoMode]);

  // Note: dateTimeModeはhome.tsxで管理されているため、ここでは従来の動作を保持


  const addMeeting = (dateTimeMode?: 'scheduled' | 'undetermined') => {
    const errors = validateForm(formData, dateTimeMode);
    if (Object.keys(errors).length > 0) {
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
              meetingType: formData.meetingType || editingMeeting.meetingType || 'offline',
              meetingLocation: formData.meetingLocation || '',
              preferredOptions: dateTimeMode === 'undetermined' ? [] : formData.preferredOptions.filter(option => option.date && option.timeSlot),
              confirmedDate: editingMeeting.confirmedDate || '',
              confirmedTimeSlot: editingMeeting.confirmedTimeSlot || '',
              confirmedStartTime: editingMeeting.confirmedStartTime || '',
              confirmedEndTime: editingMeeting.confirmedEndTime || '',
              meetingResult: editingMeeting.meetingResult || ''
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
        meetingLocation: formData.meetingLocation || '',
        preferredOptions: dateTimeMode === 'undetermined' ? [] : formData.preferredOptions.filter(option => option.date && option.timeSlot),
        confirmedDate: '',
        confirmedTimeSlot: '',
        confirmedStartTime: '',
        confirmedEndTime: '',
        status: 'pending',
        meetingResult: ''
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
      meetingLocation: meeting.meetingLocation || '',
      preferredOptions: [
        ...meeting.preferredOptions,
        ...Array(5 - meeting.preferredOptions.length).fill({ date: '', timeSlot: '' })
      ].slice(0, 5)
    });
    setShowForm(true);
  };

  const startInlineEdit = (meetingId: number) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      setInlineEditingId(meetingId);
      setInlineEditingData({ ...meeting }); // 編集用の一時データを作成
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineEditingData(null); // 編集用データをクリア
  };

  const saveInlineEdit = (meetingId: number, updatedMeeting?: Partial<Meeting>) => {
    // inlineEditingDataを使用して保存、引数のupdatedMeetingは後方互換性のため
    const dataToSave = updatedMeeting || inlineEditingData;
    if (dataToSave) {
      setMeetings(meetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, ...dataToSave }
          : meeting
      ));
    }
    setInlineEditingId(null);
    setInlineEditingData(null);
    showToast('面談情報を更新しました。', 'success');
  };

  const updateInlineMeetingField = (meetingId: number, field: keyof Meeting, value: any) => {
    // 編集中の一時データを更新（実際のmeetingsは更新しない）
    if (inlineEditingData && inlineEditingData.id === meetingId) {
      setInlineEditingData({ ...inlineEditingData, [field]: value });
    }
  };

  const updateInlinePreferredOption = (meetingId: number, index: number, field: 'date' | 'timeSlot', value: string) => {
    if (inlineEditingData && inlineEditingData.id === meetingId) {
      const newOptions = [...inlineEditingData.preferredOptions];
      // 配列が足りない場合は拡張
      while (newOptions.length <= index) {
        newOptions.push({ date: '', timeSlot: '' });
      }
      newOptions[index] = { ...newOptions[index], [field]: value };
      setInlineEditingData({ ...inlineEditingData, preferredOptions: newOptions });
    }
  };

  const updateMeetingResult = (meetingId: number, result: string) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, meetingResult: result }
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
          status: (event.confirmedDate && event.confirmedStartTime && event.confirmedEndTime) ? 'confirmed' : 'pending',
          meetingResult: ''
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
    
    // フォームが表示された後にスクロール
    if (!showForm) {
      setTimeout(() => {
        const formElement = document.getElementById('meeting-form');
        if (formElement) {
          formElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  const togglePrivacyMode = () => {
    setPrivacyMode(!privacyMode);
  };

  const scrollToMeeting = (meetingId: number) => {
    const element = document.getElementById(`meeting-${meetingId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Add a temporary highlight effect
      element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
      }, 2000);
    }
  };

  const handleDataExport = () => {
    try {
      exportMeetingData(meetings);
      showToast('データをエクスポートしました', 'success');
    } catch (error) {
      console.error('データエクスポートエラー:', error);
      showToast('データのエクスポートに失敗しました', 'error');
    }
  };

  const handleDataImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedMeetings = await importMeetingData(file);
      setMeetings(importedMeetings);
      showToast(`${importedMeetings.length}件の面談データをインポートしました`, 'success');
    } catch (error) {
      console.error('データインポートエラー:', error);
      showToast('データのインポートに失敗しました: ' + (error as Error).message, 'error');
    }
    
    // ファイル入力をリセット
    event.target.value = '';
  };

  return {
    // State
    meetings,
    showForm,
    editingMeeting,
    inlineEditingId,
    inlineEditingData,
    showImportDialog,
    showTimeDialog,
    timeDialogData,
    notificationTimes,
    formData,
    validationErrors,
    toasts,
    privacyMode,
    isDemoMode,
    
    // Actions
    addMeeting,
    editMeeting,
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit,
    updateInlineMeetingField,
    updateInlinePreferredOption,
    updateMeetingResult,
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
    togglePrivacyMode,
    toggleDemoMode,
    scrollToMeeting,
    handleDataExport,
    handleDataImport,
    
    // Setters
    setShowImportDialog,
    setShowTimeDialog,
    setFormData
  };
};
