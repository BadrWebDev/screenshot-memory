import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as MediaLibrary from 'expo-media-library';
import { uploadScreenshot } from '../services/api';
import { getLastChecked, setLastChecked } from '../utils/storage';

export const SCREENSHOT_TASK = 'SCREENSHOT_WATCHER_TASK';

// Define the task — must be called at the top level (module scope)
TaskManager.defineTask(SCREENSHOT_TASK, async () => {
  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') return BackgroundFetch.BackgroundFetchResult.NoData;

    // Find the Screenshots album
    const album = await MediaLibrary.getAlbumAsync('Screenshots');
    if (!album) return BackgroundFetch.BackgroundFetchResult.NoData;

    const lastChecked = await getLastChecked();
    const now = Date.now();

    const { assets } = await MediaLibrary.getAssetsAsync({
      album,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      first: 20,
    });

    const newAssets = assets.filter(
      (a) => a.creationTime * 1000 > lastChecked
    );

    if (newAssets.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    for (const asset of newAssets) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(asset);
        await uploadScreenshot(info.localUri || info.uri);
      } catch (e) {
        console.log('[ScreenshotWatcher] Upload error:', e.message);
      }
    }

    await setLastChecked(now);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.log('[ScreenshotWatcher] Task error:', e.message);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerScreenshotWatcher = async () => {
  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') return;

    await BackgroundFetch.registerTaskAsync(SCREENSHOT_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (Android minimum)
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('[ScreenshotWatcher] Registered');
  } catch (e) {
    console.log('[ScreenshotWatcher] Registration error:', e.message);
  }
};
