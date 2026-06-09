'use client';

import { FormEvent, useState } from 'react';
import type { TodoCategory, TodoItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Section } from './Section';

const categories: TodoCategory[] = ['School', 'Basketball', 'Personal', 'Admin', 'Urgent'];
const starterTasks: TodoItem[] = [
  { id: 'todo-1', title: 'Review practice notes', category: 'Basketball', done: false },
  { id: 'todo-2', title: 'Submit weekly GA hours', category: 'Admin', done: false },
];

export function TodoList() {
  const [tasks, setTasks] = useLocalStorage<TodoItem[]>('hayley.todos', starterTasks);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TodoCategory>('School');

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setTasks([{ id: crypto.randomUUID(), title: title.trim(), category, done: false }, ...tasks]);
    setTitle('');
  }

  return (
    <Section title="Personal To-Do List" eyebrow="Saved locally" id="todo">
      <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]" onSubmit={addTask}>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          <span>Task</span>
          <input
            className="rounded-lg border-stone-200 bg-white text-sm font-normal text-ink placeholder:text-stone-400 focus:border-redbird-500 focus:ring-redbird-500/20"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-stone-700">
          <span>Category</span>
          <select
            className="rounded-lg border-stone-200 bg-white text-sm font-normal text-ink focus:border-redbird-500 focus:ring-redbird-500/20"
            value={category}
            onChange={(event) => setCategory(event.target.value as TodoCategory)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button
          className="self-end rounded-lg bg-redbird-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-redbird-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-redbird-500/30"
          type="submit"
        >
          Add
        </button>
      </form>
      <div className="mt-4 grid gap-3">
        {tasks.map((task) => (
          <article className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" key={task.id}>
            <label className="flex items-center gap-3 text-sm font-bold text-ink">
              <input
                className="size-4 rounded border-stone-300 text-redbird-500 focus:ring-redbird-500/30"
                type="checkbox"
                checked={task.done}
                onChange={() =>
                  setTasks(tasks.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)))
                }
              />
              <span className={task.done ? 'text-stone-500 line-through' : ''}>{task.title}</span>
            </label>
            <span className="h-fit w-fit rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-600">
              {task.category}
            </span>
            <button
              type="button"
              className="w-fit rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-600 transition hover:border-redbird-500/40 hover:text-redbird-600"
              aria-label={`Delete ${task.title}`}
              onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </Section>
  );
}
