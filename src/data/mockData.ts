import type {
  Assignment,
  CalendarEvent,
  EmailMessage,
  PriorityItem,
  QuickLink,
  SetupStatusItem,
} from '../types';

export const quickLinks: QuickLink[] = [
  {
    title: 'Gmail',
    description: 'Forwarded school emails and Canvas notifications',
    href: 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox',
    initials: 'GM',
  },
  {
    title: 'Google Calendar',
    description: 'Basketball schedule and Canvas deadlines',
    href: 'https://calendar.google.com/calendar/u/0/r/week',
    initials: 'GC',
  },
  {
    title: 'Canvas',
    description: 'Classes, assignments and course updates',
    href: 'https://canvas.illinoisstate.edu/courses',
    initials: 'CV',
  },
  {
    title: 'Teamworks',
    description: 'Basketball schedule, team events and travel',
    href: 'https://www.teamworksapp.com/home/overview',
    initials: 'TW',
  },
  {
    title: 'Outlook',
    description: 'Original Illinois State inbox',
    href: 'https://outlook.cloud.microsoft/mail/inbox',
    initials: 'OU',
  },
];

export const mockEmails: EmailMessage[] = [
  {
    id: 'email-1',
    from: 'Canvas Notifications',
    subject: 'Assignment due tomorrow: Facility Operations Reflection',
    snippet: 'Reminder that your reflection is due by 11:59 PM tomorrow.',
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
    title: 'Sport Management Seminar',
    start: '2026-06-08T10:00:00',
    end: '2026-06-08T11:15:00',
    dayLabel: 'Today',
    source: 'Canvas',
    location: 'Zoom',
  },
  {
    id: 'event-2',
    title: 'Team film review',
    start: '2026-06-08T13:00:00',
    end: '2026-06-08T14:00:00',
    dayLabel: 'Today',
    source: 'Basketball',
    location: 'Basketball office',
  },
  {
    id: 'event-3',
    title: 'Practice',
    start: '2026-06-08T15:30:00',
    end: '2026-06-08T17:30:00',
    dayLabel: 'Today',
    source: 'Basketball',
    location: 'CEFCU Arena',
  },
  {
    id: 'event-4',
    title: 'Travel roster deadline',
    start: '2026-06-09T09:30:00',
    end: '2026-06-09T10:00:00',
    dayLabel: 'Tomorrow',
    source: 'Basketball',
    location: 'Basketball office',
  },
  {
    id: 'event-5',
    title: 'Assignment check-in',
    start: '2026-06-09T14:00:00',
    end: '2026-06-09T14:30:00',
    dayLabel: 'Tomorrow',
    source: 'Canvas',
    location: 'Online',
  },
  {
    id: 'event-6',
    title: 'Review scouting notes',
    start: '2026-06-10T18:00:00',
    end: '2026-06-10T18:30:00',
    dayLabel: 'Next 7 days',
    source: 'Basketball',
  },
  {
    id: 'event-7',
    title: 'Recruiting admin block',
    start: '2026-06-12T11:00:00',
    end: '2026-06-12T12:00:00',
    dayLabel: 'Next 7 days',
    source: 'Basketball',
    location: 'Basketball office',
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    title: 'Facility Operations Reflection',
    course: 'SPM 451',
    dueDate: 'Tomorrow, 11:59 PM',
    status: 'Due Soon',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
  },
  {
    id: 'assignment-2',
    title: 'Leadership Discussion Reply',
    course: 'SPM 404',
    dueDate: 'Friday, 5:00 PM',
    status: 'Upcoming',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
  },
  {
    id: 'assignment-3',
    title: 'Budget Case Study Notes',
    course: 'SPM 478',
    dueDate: 'Yesterday',
    status: 'Overdue',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
  },
  {
    id: 'assignment-4',
    title: 'Event Revenue Worksheet',
    course: 'SPM 462',
    dueDate: 'Next Wednesday, 8:00 PM',
    status: 'Done',
    canvasUrl: 'https://canvas.illinoisstate.edu/courses',
  },
];

export const mockPriorityItems: PriorityItem[] = [
  {
    id: 'priority-1',
    title: 'Confirm travel roster',
    detail: 'Email says action needed before noon.',
    level: 'high',
    source: 'Gmail',
  },
  {
    id: 'priority-2',
    title: 'Team film review',
    detail: 'Basketball event is on today’s schedule.',
    level: 'high',
    source: 'Calendar',
  },
  {
    id: 'priority-3',
    title: 'Facility Operations Reflection',
    detail: 'Canvas assignment due tomorrow.',
    level: 'medium',
    source: 'Canvas',
  },
  {
    id: 'priority-4',
    title: 'Scan urgent Gmail items',
    detail: 'Canvas and Illinois State messages are forwarded into Gmail.',
    level: 'medium',
    source: 'Gmail',
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
