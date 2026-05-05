// Design tokens — single source of truth for colors, typography, spacing

export const colors = {
  bg: '#0f0f0f',
  surface: '#131313',
  surfaceElevated: '#1c1b1b',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.08)',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.4)',
  accent: '#ffffff',
  onAccent: '#2f3131',
  accentSoft: 'rgba(255,255,255,0.1)',
  danger: '#ffb4ab',
  success: '#4CAF50',
  inputBg: 'rgba(255,255,255,0.05)',
  pillActive: '#ffffff',
  pillInactive: 'rgba(255,255,255,0.05)',
  pillBorderActive: '#ffffff',
  pillBorderInactive: 'rgba(255,255,255,0.1)',
  navBg: '#0f0f0f',
  sheetBg: 'rgba(15,15,15,0.85)',
  sheetBorder: 'rgba(255,255,255,0.12)',
};

export const categoryColors = {
  Shopping: { bg: 'rgba(245,158,11,0.2)', text: '#FCD34D' },
  Food:     { bg: 'rgba(34,197,94,0.2)', text: '#86EFAC' },
  Places:   { bg: 'rgba(99,102,241,0.2)', text: '#A5B4FC' },
  Finance:  { bg: 'rgba(56,189,248,0.2)', text: '#7DD3FC' },
  Recipes:  { bg: 'rgba(20,184,166,0.2)', text: '#5EEAD4' },
  Quotes:   { bg: 'rgba(244,63,94,0.2)', text: '#FDA4AF' },
  Social:   { bg: 'rgba(26,42,26,0.95)', text: '#69BB6B' },
  Other:    { bg: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.7)' },
};

export const getCategoryStyle = (category) =>
  categoryColors[category] || categoryColors.Other;

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.68,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  headline1: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  headline2: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.17,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.17,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },
  bodySm: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  labelCaps: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  badge: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    color: colors.text,
  },
};

export const spacing = {
  unit: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  marginMain: 16,
  gutter: 12,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  card: 20,
  full: 999,
};

export const CATEGORIES = ['All', 'Shopping', 'Food', 'Places', 'Finance', 'Recipes', 'Quotes', 'Social', 'Other'];
