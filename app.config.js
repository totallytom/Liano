// Converted from app.json to app.config.js so the AdMob App ID can be read from .env —
// static app.json can't reference environment variables.

// Google's official test App IDs — safe placeholders for platforms without a real AdMob App ID yet.
const TEST_ADMOB_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
const TEST_ADMOB_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

module.exports = {
  expo: {
    name: 'Liano',
    slug: 'BusinessCard',
    version: '1.0.0',
    scheme: 'vcard',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    ios: {
      icon: './assets/icon.png',
      supportsTablet: true,
      bundleIdentifier: 'com.totallytom.BusinessCard',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        'android.permission.READ_CONTACTS',
        'android.permission.WRITE_CONTACTS',
        'android.permission.NFC',
        'com.google.android.gms.permission.AD_ID',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      output: 'single',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-contacts',
        {
          contactsPermission: 'Allow this app to save contacts to your address book.',
        },
      ],
      [
        'react-native-nfc-manager',
        {
          nfcPermission: 'Allow this app to write your card to an NFC tag so others can tap to receive it.',
          includeNdefEntitlement: true,
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: process.env.ADMOB_ANDROID_APP_ID || TEST_ADMOB_ANDROID_APP_ID,
          iosAppId: process.env.ADMOB_IOS_APP_ID || TEST_ADMOB_IOS_APP_ID,
          userTrackingUsageDescription:
            'This identifier is used to show you relevant ads that help keep this app free.',
        },
      ],
      'expo-tracking-transparency',
    ],
    extra: {
      router: {},
      eas: {
        projectId: '45014558-fedf-465c-b8db-2d82dfb66f09',
      },
    },
  },
};
