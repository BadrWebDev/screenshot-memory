cat > src/store/useScreenshotStore.js << 'EOF'
import { create } from 'zustand';

const useScreenshotStore = create((set) => ({
  screenshots: [],
  loading: false,
  setScreenshots: (screenshots) => set({ screenshots }),
  addScreenshot: (screenshot) =>
    set((state) => ({ screenshots: [screenshot, ...state.screenshots] })),
  removeScreenshot: (id) =>
    set((state) => ({
      screenshots: state.screenshots.filter((s) => s.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}));

export default useScreenshotStore;
EOF