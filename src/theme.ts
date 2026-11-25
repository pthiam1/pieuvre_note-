import type { AppTheme } from './types';

export const ORANGE = '#F36B12';

export const themes: Record<'light' | 'dark', AppTheme> = {
  light: {
    background: '#F6F4FA',
    surface: '#FFFFFF',
    surfaceAlt: '#FCFBFE',
    text: '#242039',
    muted: '#77738A',
    border: '#EEEAF4',
    purple: '#4B16A8',
    orange: ORANGE,
    chip: '#F2EDFA',
    chipText: '#242039',
  },
  dark: {
    background: '#171421',
    surface: '#242031',
    surfaceAlt: '#2D293B',
    text: '#F4F1FA',
    muted: '#B1ABBF',
    border: '#393448',
    purple: '#B69AF2',
    orange: '#FF8A3D',
    chip: '#393149',
    chipText: '#F4F1FA',
  },
};
