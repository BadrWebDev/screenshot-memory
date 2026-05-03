import { create } from 'zustand';

const useScreenshotStore = create((set) => ({
  screenshots: [],
  loading: false,
  uploading: false,
  setScreenshots: (screenshots) => set({ screenshots }),
  addScreenshot: (screenshot) =>
    set((state) => ({ screenshots: [screenshot, ...state.screenshots] })),
  removeScreenshot: (id) =>
    set((state) => ({
      screenshots: state.screenshots.filter((s) => s.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
}));

export default useScreenshotStore;