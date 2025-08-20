import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kalame.ai',
  appName: 'Kalame AI',
  webDir: 'build',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#ffffff",
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined
    }
  },
  ios: {
    backgroundColor: "#ffffff",
    contentInset: "always",
    scrollEnabled: false,
    webContentsDebuggingEnabled: true
  }
};

export default config;
