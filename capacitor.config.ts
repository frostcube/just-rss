import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.frostcube.justrss',
  appName: 'Just RSS',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https'
  },
  android: {
    adjustMarginsForEdgeToEdge: 'auto'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
