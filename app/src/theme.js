// Design tokens — single source of truth for colors, typography, spacing

export const colors = {
  bg: '#0f0f0f',
  bgElevated: '#161616',
  card: '#1a1a1a',
  cardBorder: '#2a2a2a',
  accent: '#6C63FF',
  accentSoft: '#6C63FF22',
  text: '#ffffff',
  textSecondary: '#999999',
  textMuted: '#444444',
  danger: '#FF4B4B',
  success: '#4CAF50',
  inputBg: '#222222',
  pillActive: '#6C63FF',
  pillInactive: '#1e1e1e',
  pillBorderActive: '#6C63FF',
  pillBorderInactive: '#2a2a2a',
};

export const categoryColors = {
  Shopping: { bg: '#1a2744', text: '#6B9EF8' },
  Food:     { bg: '#1a2e1a', text: '#66BB6A' },
  Places:   { bg: '#2a1a2e', text: '#CE93D8' },
  Finance:  { bg: '#2e2a1a', text: '#FFD54F' },
  Recipes:  { bg: '#2e1a1a', text: '#FF8A65' },
  Quotes:   { bg: '#1a2e2e', text: '#4DD0E1' },
  Other:    { bg: '#222222', text: '#AAAAAA' },
};

export const getCategoryStyle = (category) =>
  categoryColors[category] || categoryColors.Other;

export const typography = {
  heading1: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  heading2: { fontSize: 20, fontWeight: '600', color: colors.text },
  body:     { fontSize: 15, fontWeight: '400', color: colors.text, lineHeight: 22 },
  caption:  { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  badge:    { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const CATEGORIES = ['All', 'Shopping', 'Food', 'Places', 'Finance', 'Recipes', 'Quotes', 'Other'];
