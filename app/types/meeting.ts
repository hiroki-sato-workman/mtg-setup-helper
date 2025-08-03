export interface PreferredOption {
  date: string;
  timeSlot: string;
}

export interface Meeting {
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

export interface FormData {
  name: string;
  image: string;
  notes: string;
  preferredOptions: PreferredOption[];
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface TimeDialogData {
  meetingId: number;
  date: string;
  timeSlot: string;
}

export interface Schedule {
  date: string;
  timeSlot: string;
  meetingName: string;
  meetingImage: string;
  priority: number;
  notes: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface TimeSlot {
  value: string;
  label: string;
}