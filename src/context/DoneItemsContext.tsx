'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface DoneItemsContextType {
  doneIds: Set<string>;
  toggleDone: (id: string) => void;
}

const DoneItemsContext = createContext<DoneItemsContextType>({
  doneIds: new Set(),
  toggleDone: () => {},
});

export function DoneItemsProvider({ children }: { children: ReactNode }) {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Key includes today's date so it auto-resets each morning
    const today = new Date().toDateString();
    try {
      const stored = localStorage.getItem(`done-${today}`);
      if (stored) setDoneIds(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const toggleDone = useCallback((id: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      const today = new Date().toDateString();
      localStorage.setItem(`done-${today}`, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return (
    <DoneItemsContext.Provider value={{ doneIds, toggleDone }}>
      {children}
    </DoneItemsContext.Provider>
  );
}

export const useDoneItems = () => useContext(DoneItemsContext);
