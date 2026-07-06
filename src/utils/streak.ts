import { differenceInCalendarDays, isSameDay } from "date-fns";

import { StudyStreak } from "../types";

/** Avança o streak de estudo: mesmo dia não conta de novo, dia consecutivo incrementa, gap reseta para 1. */
export function advanceStreak(current: StudyStreak, nowISO: string): StudyStreak {
  if (!current.lastDateISO) return { count: 1, lastDateISO: nowISO };

  const now = new Date(nowISO);
  const last = new Date(current.lastDateISO);
  if (isSameDay(now, last)) return current;

  const diff = differenceInCalendarDays(now, last);
  return { count: diff === 1 ? current.count + 1 : 1, lastDateISO: nowISO };
}
