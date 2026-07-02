import {
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isSameDay,
  isToday,
  isTomorrow,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(iso: string): string {
  return format(new Date(iso), "dd 'de' MMMM", { locale: ptBR });
}

export function formatShortDate(iso: string): string {
  return format(new Date(iso), "dd/MM", { locale: ptBR });
}

export function formatTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function formatFullDate(iso: string): string {
  return format(new Date(iso), "EEEE, dd 'de' MMMM 'às' HH:mm", {
    locale: ptBR,
  });
}

export function daysUntil(iso: string): number {
  return differenceInCalendarDays(new Date(iso), new Date());
}

export function minutesUntil(iso: string): number {
  return differenceInMinutes(new Date(iso), new Date());
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

/** "Vence em 3 dias", "Vence hoje às 18:00", "Atrasada há 2 dias" */
export function deadlineLabel(iso: string): string {
  const date = new Date(iso);
  const days = daysUntil(iso);
  if (isOverdue(iso)) {
    if (isToday(date)) return `Venceu hoje às ${formatTime(iso)}`;
    const late = Math.abs(days);
    return late === 1 ? "Atrasada há 1 dia" : `Atrasada há ${late} dias`;
  }
  if (isToday(date)) return `Vence hoje às ${formatTime(iso)}`;
  if (isTomorrow(date)) return `Vence amanhã às ${formatTime(iso)}`;
  return days === 1 ? "Vence em 1 dia" : `Vence em ${days} dias`;
}

/** "Faltam 6 dias", "É hoje!" — contagem regressiva de provas */
export function countdownLabel(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return "É hoje!";
  if (isOverdue(iso)) return "Já aconteceu";
  if (isTomorrow(date)) return "É amanhã";
  const days = daysUntil(iso);
  return days === 1 ? "Falta 1 dia" : `Faltam ${days} dias`;
}

export function greeting(name: string): string {
  const hour = new Date().getHours();
  const period =
    hour < 5 ? "Boa noite" : hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  return name ? `${period}, ${name}` : period;
}

export { isSameDay, isToday };
