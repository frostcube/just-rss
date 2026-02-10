import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.frostcube.justrss',
  appName: 'Just RSS',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SystemBars: {
      insetsHandling: 'css'
    }
  }
};

export default config;
