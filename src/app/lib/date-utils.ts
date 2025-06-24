// src/app/lib/date-utils.ts
// Utility functions for date formatting and display

export function formatDate(dateStr: string | number, locale: string): string {
  const date = new Date(dateStr);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString(locale, dateOptions);
}

export function formatDateAsDay(dateStr: string | number, locale: string): string {
  const date = new Date(dateStr);
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short'
  };
  return date.toLocaleDateString(locale, dateOptions);
}

export function formatDateAsLong(dateStr: string | number, locale: string): string {
  const date = new Date(dateStr);
  const dateOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString(locale, dateOptions);
}

export function formatDateRelative(dateStr: string | number, locale: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Remove time for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return formatDate(dateStr, locale);
  }
}
