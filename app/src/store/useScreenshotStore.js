import { create } from 'zustand';
import { setFavorites as persistFavorites } from '../utils/storage';

const useScreenshotStore = create((set) => ({
  screenshots: [],
  favorites: [],
  loading: false,
  uploading: false,
  setFavorites: (favorites) => set({ favorites }),
  setScreenshots: (screenshots) => set({ screenshots }),
  addScreenshot: (screenshot) =>
    set((state) => {
      if (state.screenshots.some((s) => s.id === screenshot.id)) {
        return state;
      }
      return { screenshots: [screenshot, ...state.screenshots] };
    }),
  removeScreenshot: (id) =>
    set((state) => {
      const nextFavorites = state.favorites.filter((favoriteId) => favoriteId !== id);
      persistFavorites(nextFavorites);
      return {
        screenshots: state.screenshots.filter((s) => s.id !== id),
        favorites: nextFavorites,
      };
    }),
  clearScreenshots: () =>
    set(() => {
      persistFavorites([]);
      return { screenshots: [], favorites: [] };
    }),
  addFavorite: async (id) => {
    set((state) => {
      if (state.favorites.includes(id)) {
        return state;
      }
      const nextFavorites = [id, ...state.favorites];
      persistFavorites(nextFavorites);
      return { favorites: nextFavorites };
    });
  },
  removeFavorite: async (id) => {
    set((state) => {
      const nextFavorites = state.favorites.filter((favoriteId) => favoriteId !== id);
      persistFavorites(nextFavorites);
      return { favorites: nextFavorites };
    });
  },
  toggleFavorite: async (id) => {
    const { favorites, addFavorite, removeFavorite } = useScreenshotStore.getState();
    if (favorites.includes(id)) {
      await removeFavorite(id);
      return;
    }
    await addFavorite(id);
  },
  toggleStar: async (id) => {
    const { toggleFavorite } = useScreenshotStore.getState();
    await toggleFavorite(id);
  },
  updateScreenshot: (id, updatedData) =>
    set((state) => ({
      screenshots: state.screenshots.map((s) =>
        s.id === id ? { ...s, ...updatedData } : s
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
}));

export default useScreenshotStore;