import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.personal.routines',
  appName: 'الروتينات',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
