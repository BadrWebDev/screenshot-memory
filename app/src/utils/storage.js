import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  HAS_ONBOARDED: '@screenshot_memory/has_onboarded_v18',
  LAST_CHECKED: '@screenshot_memory/last_checked_v18',
  FAVORITES: '@memory/favorites',
};

export const getHasOnboarded = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.HAS_ONBOARDED);
    return val === 'true';
  } catch {
    return false;
  }
};

export const setHasOnboarded = async () => {
  try {
    await AsyncStorage.setItem(KEYS.HAS_ONBOARDED, 'true');
  } catch {}
};

export const getLastChecked = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.LAST_CHECKED);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

export const setLastChecked = async (timestamp) => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_CHECKED, String(timestamp));
  } catch {}
};

export const getFavorites = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.FAVORITES);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
};

export const setFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
  } catch {}
};
