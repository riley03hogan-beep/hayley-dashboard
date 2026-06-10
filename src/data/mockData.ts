import type {
  Assignment,
  CalendarEvent,
  EmailMessage,
  SetupStatusItem,
  WaitingItem,
} from '../types';

const todayAt = (hour: number, minute = 0) => dateAt(0, hour, minute);
const tomorrowAt = (hour: number, minute = 0) => dateAt(1, hour, minute);
const daysFromNowAt = (days: number, hour: number, minute = 0) => dateAt(days, hour, minute);

function dateAt(daysFromNow: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

export const mockEmails: EmailMessage[] = [
  {
    id: 'email-1',
    from: 'SPM 451 Instructor',
    subject: 'Article Analysis due today',
    snippet: 'Reminder that your article analysis is due by 11:59 PM tonight.',
    receivedAt: '8:14 AM',
    unread: true,
    important: true,
    category: 'Assignments',
  },
  {
    id: 'email-2',
    from: 'Coach Staff',
    subject: 'Action needed: travel roster confirmation',
    snippet: 'Please confirm the travel roster and hotel note before noon.',
    receivedAt: '9:02 AM',
    unread: true,
    important: true,
    category: 'Travel',
  },
  {
    id: 'email-3',
    from: 'Illinois State Outlook Forwarding',
    subject: 'Graduate assistant payroll reminder',
    snippet: 'Timesheet approval is required before Friday afternoon.',
    receivedAt: 'Yesterday',
    unread: false,
    important: false,
    category: 'Illinois State',
  },
  {
    id: 'email-4',
    from: 'Teamworks',
    subject: 'Practice schedule updated',
    snippet: 'Today’s film block moved 30 minutes earlier.',
    receivedAt: 'Yesterday',
    unread: true,
    important: false,
    category: 'Basketball',
  },
  {
    id: 'email-5',
    from: 'SPM 451 Instructor',
    subject: 'Office hour reminder for project questions',
    snippet: 'I will be available this afternoon for final project questions.',
    receivedAt: 'Yesterday',
    unread: false,
    important: false,
    category: 'Illinois State',
  },
];

export const mockEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Kids Camp',
    start: todayAt(9),
    end: todayAt(11),
    dayLabel: 'Today',
    source: 'Basketball',
    location: 'CEFCU Arena',
  },
  {
    id: 'event-2',
    title: 'Weights',
    start: todayAt(12),
    end: todayAt(13),
    dayLabel: 'Today',
    source: 'Basketball',
    location: 'Performance center',
  },
  {
    id: 'event-3',
    title: 'Practice',
    start: todayAt(15, 30),
    end: todayAt(17, 30),
    dayLabel: 'Today',
    source: 'Basketball',
    location: 'CEFCU Arena',
  },
  {
    id: 'event-4',
    title: 'Recruiting admin check-in',
    start: tomorrowAt(9, 30),
    end: tomorrowAt(10),
    dayLabel: 'Tomorrow',
    source: 'Basketball',
    location: 'Basketball office',
  },
  {
    id: 'event-5',
    title: 'Nutrition talk notes review',
    start: tomorrowAt(14),
    end: tomorrowAt(14, 30),
    dayLabel: 'Tomorrow',
    source: 'Basketball',
    location: 'Online',
  },
  {
    id: 'event-6',
    title: 'Review scouting notes',
    start: daysFromNowAt(2, 18),
    end: daysFromNowAt(2, 18, 30),
    dayLabel: 'Next 7 days',
    source: 'Basketball',
  },
  {
    id: 'event-7',
    title: 'Recruiting admin block',
    start: daysFromNowAt(4, 11),
    end: daysFromNowAt(4, 12),
    dayLabel: 'Next 7 days',
    source: 'Basketball',
    location: 'Basketball office',
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    title: 'Article Analysis',
    course: 'SPM 451',
    dueDate: 'Today, 11:59 PM',
    status: 'Due Soon',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
    estimatedMinutes: 90,
    dueAt: todayAt(23, 59),
  },
  {
    id: 'assignment-2',
    title: 'Leadership Discussion Reply',
    course: 'SPM 404',
    dueDate: 'Tomorrow, 5:00 PM',
    status: 'Upcoming',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
    estimatedMinutes: 20,
    dueAt: tomorrowAt(17),
  },
  {
    id: 'assignment-3',
    title: 'Budget Case Study Notes',
    course: 'SPM 478',
    dueDate: 'Yesterday',
    status: 'Overdue',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
    estimatedMinutes: 45,
    dueAt: daysFromNowAt(-1, 23, 59),
  },
  {
    id: 'assignment-4',
    title: 'Sport Team Report',
    course: 'SPM 462',
    dueDate: 'Friday, 8:00 PM',
    status: 'Upcoming',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
    estimatedMinutes: 180,
    dueAt: daysFromNowAt(3, 20),
  },
];

export const mockWaitingOn: WaitingItem[] = [
  {
    id: 'waiting-1',
    title: 'Housing approval',
    owner: 'Housing office',
    nextCheck: 'Check Friday',
  },
  {
    id: 'waiting-2',
    title: 'Scholarship disbursement',
    owner: 'Financial aid',
    nextCheck: 'Check next business day',
  },
  {
    id: 'waiting-3',
    title: 'Coach response on camp schedule',
    owner: 'Coach staff',
    nextCheck: 'Follow up after practice',
  },
];

export const setupStatusItems: SetupStatusItem[] = [
  {
    label: 'Gmail connected',
    connected: false,
    note: 'OAuth credentials are not configured yet.',
  },
  {
    label: 'Google Calendar connected',
    connected: false,
    note: 'Calendar API client is ready for credentials.',
  },
  {
    label: 'Canvas feed connected through Google Calendar',
    connected: true,
    note: 'Canvas calendar feed is connected to Google Calendar.',
  },
  {
    label: 'Teamworks',
    connected: true,
    note: 'Teamworks is integrated with Google Calendar.',
  },
  {
    label: 'Outlook forwarding',
    connected: true,
    note: 'Illinois State Outlook forwards to Gmail.',
  },
];
