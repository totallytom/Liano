// react-native-google-mobile-ads imports native-only RN internals (its BannerAd component uses
// codegenNativeComponent), which breaks the web bundle just by being imported — so this web
// variant never imports it at all. Metro picks this file automatically for web builds.

export async function initAds(): Promise<void> {}

export function showRewardedAd(): Promise<boolean> {
  return Promise.resolve(false);
}
