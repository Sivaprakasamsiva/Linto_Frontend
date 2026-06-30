// Utility helper tests
import { describe, it, expect } from 'vitest';
import {
  formatPrice, formatDate, timeAgo, truncate, getInitials,
  getStatusColor, getStatusLabel, getConditionLabel, timeRemaining,
} from '../utils/helpers';

describe('formatPrice', () => {
  it('formats number as INR', () => {
    expect(formatPrice(50000)).toMatch(/₹/);
    expect(formatPrice(50000)).toMatch(/50,000/);
  });
  it('handles string input', () => {
    expect(formatPrice('1000')).toMatch(/₹/);
  });
  it('handles null/undefined', () => {
    expect(formatPrice(null)).toBe('₹0');
    expect(formatPrice(undefined)).toBe('₹0');
  });
});

describe('formatDate', () => {
  it('formats valid date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toMatch(/2024/);
  });
  it('returns empty for null', () => {
    expect(formatDate(null)).toBe('');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('just now');
  });
  it('returns minutes ago', () => {
    const five_min_ago = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(five_min_ago)).toBe('5m ago');
  });
  it('returns hours ago', () => {
    const two_hr_ago = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(two_hr_ago)).toBe('2h ago');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World This Is Long', 10)).toBe('Hello Worl...');
  });
  it('returns short strings unchanged', () => {
    expect(truncate('Hello', 100)).toBe('Hello');
  });
});

describe('getInitials', () => {
  it('gets initials from full name', () => {
    expect(getInitials('Ramesh Kumar')).toBe('RK');
  });
  it('handles single name', () => {
    expect(getInitials('Ramesh')).toBe('R');
  });
  it('handles empty', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('getStatusLabel', () => {
  it('returns label for known status', () => {
    expect(getStatusLabel('available')).toBe('Available');
    expect(getStatusLabel('sold')).toBe('Sold');
  });
  it('returns status for unknown', () => {
    expect(getStatusLabel('unknown')).toBe('unknown');
  });
});

describe('getConditionLabel', () => {
  it('returns label for known condition', () => {
    expect(getConditionLabel('new')).toBe('Brand New');
    expect(getConditionLabel('like_new')).toBe('Like New');
  });
});

describe('timeRemaining', () => {
  it('returns "Expired" for 0 or negative', () => {
    expect(timeRemaining(0)).toBe('Expired');
    expect(timeRemaining(-100)).toBe('Expired');
  });
  it('returns hours and minutes for positive', () => {
    const result = timeRemaining(5400); // 1.5 hours
    expect(result).toMatch(/1h/);
    expect(result).toMatch(/30m/);
  });
  it('returns minutes only for under an hour', () => {
    expect(timeRemaining(300)).toBe('5m left');
  });
});
