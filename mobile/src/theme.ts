import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1e3a8a', // Primary blue
    secondary: '#3b82f6', // Secondary blue
    tertiary: '#eab308', // Accent yellow
    surface: '#ffffff',
    surfaceVariant: '#f8fafc',
    onSurface: '#1f2937',
    onSurfaceVariant: '#6b7280',
    outline: '#d1d5db',
  },
};

export const colors = {
  primaryBlue: '#1e3a8a',
  secondaryBlue: '#3b82f6',
  accentYellow: '#eab308',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray600: '#4b5563',
  gray900: '#111827',
};