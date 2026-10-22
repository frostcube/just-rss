import { formatDate, formatDateAsDay, formatDateRelative } from './date-utils';

describe('date-utils', () => {
  it('formats a date', () => {
    expect(formatDate(new Date(2024, 0, 15).getTime(), 'en-AU')).toContain('2024');
  });

  it('formats the weekday', () => {
    expect(formatDateAsDay(new Date(2024, 0, 15).getTime(), 'en-US')).toBe('Mon');
  });

  it('labels today and yesterday', () => {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    expect(formatDateRelative(now.getTime(), 'en-AU')).toBe('Today');
    expect(formatDateRelative(yesterday.getTime(), 'en-AU')).toBe('Yesterday');
  });

  it('falls back to a formatted date for older dates', () => {
    expect(formatDateRelative(new Date(2000, 5, 1).getTime(), 'en-AU')).toContain('2000');
  });
});
