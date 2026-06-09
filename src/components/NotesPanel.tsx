'use client';

import { FormEvent, useState } from 'react';
import type { NoteCategory, NoteItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Section } from './Section';

const noteCategories: NoteCategory[] = ['Class notes', 'Basketball notes', 'To ask coach', 'To do later'];
const starterNotes: NoteItem[] = [
  {
    id: 'note-1',
    body: 'Ask about updated film schedule before practice.',
    category: 'To ask coach',
    updatedAt: 'Today',
  },
];

export function NotesPanel() {
  const [notes, setNotes] = useLocalStorage<NoteItem[]>('hayley.notes', starterNotes);
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Class notes');

  function addNote(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setNotes([{ id: crypto.randomUUID(), body: body.trim(), category, updatedAt: 'Just now' }, ...notes]);
    setBody('');
  }

  return (
    <Section title="Notes" eyebrow="Quick thoughts" id="notes">
      <form className="grid gap-3" onSubmit={addNote}>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          <span>Note category</span>
          <select
            className="rounded-lg border-stone-200 bg-white text-sm font-normal text-ink focus:border-redbird-500 focus:ring-redbird-500/20"
            value={category}
            onChange={(event) => setCategory(event.target.value as NoteCategory)}
          >
            {noteCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          <span>Note</span>
          <textarea
            className="min-h-28 rounded-lg border-stone-200 bg-white text-sm font-normal text-ink placeholder:text-stone-400 focus:border-redbird-500 focus:ring-redbird-500/20"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Jot something down"
          />
        </label>
        <button
          className="w-fit rounded-lg bg-redbird-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-redbird-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-redbird-500/30"
          type="submit"
        >
          Save note
        </button>
      </form>
      <div className="mt-4 grid gap-3">
        {notes.map((note) => (
          <article className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4" key={note.id}>
            <p className="text-sm leading-relaxed text-ink">{note.body}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-600">
                {note.category}
              </span>
              <span className="text-xs font-bold text-stone-400">{note.updatedAt}</span>
              <button
                type="button"
                className="ml-auto rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-600 transition hover:border-redbird-500/40 hover:text-redbird-600"
                aria-label={`Delete note ${note.body}`}
                onClick={() => setNotes(notes.filter((item) => item.id !== note.id))}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
