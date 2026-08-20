import { Platform } from 'react-native';
import mobileAds, { AdEventType, RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const REWARDED_AD_UNIT_ID = __DEV__ ? TestIds.REWARDED : process.env.EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID!;

let initialized = false;

/** Requests ATT (iOS) and starts the Google Mobile Ads SDK. Call once at app launch. */
export async function initAds(): Promise<void> {
  if (initialized) return;
  if (Platform.OS === 'ios') {
    await requestTrackingPermissionsAsync().catch(() => {});
  }
  await mobileAds().initialize();
  initialized = true;
}

/**
 * Loads and shows a single rewarded ad. Resolves `true` only if the user watched it through to
 * completion and earned the reward — `false` on close-without-reward or a load/show error.
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);
    let earned = false;
    let settled = false;

    const cleanup = () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
    };
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => rewarded.show());
    const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => finish(earned));
    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => finish(false));

    rewarded.load();
  });
}
