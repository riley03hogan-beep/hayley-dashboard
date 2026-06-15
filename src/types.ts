export type EventSource = 'Basketball' | 'School' | 'Holiday' | 'Personal';
export type TaskStatus = 'Due Soon' | 'Upcoming' | 'Overdue' | 'Done';
export type TodoCategory = 'School' | 'Basketball' | 'Personal' | 'Admin' | 'Urgent';
export type NoteCategory = 'Class notes' | 'Basketball notes' | 'To ask coach' | 'To do later';
export type EmailCategory =
  | 'Canvas'
  | 'Basketball'
  | 'Illinois State'
  | 'Urgent'
  | 'Assignments'
  | 'Travel'
  | 'Meetings'
  | 'General';

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  unread: boolean;
  important: boolean;
  category: EmailCategory;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  dayLabel: 'Today' | 'Tomorrow' | 'Next 7 days';
  source: EventSource;
  location?: string;
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: TaskStatus;
  canvasUrl: string;
  estimatedMinutes: number;
  dueAt?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  category: TodoCategory;
  done: boolean;
}

export interface NoteItem {
  id: string;
  body: string;
  category: NoteCategory;
  updatedAt: string;
}

export interface SetupStatusItem {
  label: string;
  connected: boolean;
  note: string;
}

export interface WaitingItem {
  id: string;
  title: string;
  owner: string;
  nextCheck: string;
}
