export const Colors = {
  // Base dark theme
  background: '#14110F',
  surface: '#1E1A17',
  surfaceLight: '#2A2520',
  border: '#332D27',
  borderLight: '#453E36',

  // Text
  textPrimary: '#F5F0E6',
  textSecondary: '#B5AD9F',
  textMuted: '#8A8277',

  // Accent
  primary: '#FF5A1F',
  primaryLight: '#FF7A4A',
  // Ink: text/icons on top of primary (white on #FF5A1F is only ~3:1)
  onPrimary: '#14110F',
  success: '#22C55E',
  successLight: '#16A34A',
  error: '#FF4D6A',
  errorLight: '#E03A57',
  warning: '#F59E0B',

  // Platform brand colors
  platforms: {
    aws: '#FF9900',
    azure: '#0078D4',
    gcp: '#4285F4',
    devops: '#3DDBB0',
  } as Record<string, string>,

  // Interview topic brand colors
  interviewTopics: {
    ceph: '#EF4444',
    k8s: '#326CE5',
    docker: '#2496ED',
    linux: '#FCC624',
    ansible: '#EE0000',
    'azure-networking': '#0078D4',
  } as Record<string, string>,

  // Tab bar
  tabBar: '#14110F',
  tabBarBorder: '#1E1A17',
  tabBarActive: '#FF5A1F',
  tabBarInactive: '#8A8277',
};
