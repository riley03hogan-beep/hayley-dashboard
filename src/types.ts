export type PriorityLevel = 'high' | 'medium' | 'low';
export type EventSource = 'Teamworks' | 'Canvas' | 'Basketball' | 'Personal';
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

export interface QuickLink {
  title: string;
  description: string;
  href: string;
  initials: string;
}

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
}

export interface PriorityItem {
  id: string;
  title: string;
  detail: string;
  level: PriorityLevel;
  source: string;
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
