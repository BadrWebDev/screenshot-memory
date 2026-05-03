# 📸 Screenshot Memory

An AI-powered mobile app that automatically organizes, tags, and categorizes your screenshots. Built with React Native (Expo) and a Laravel backend powered by OpenRouter Vision AI.

---

## 🛠 Tech Stack

**Frontend (`/app`)**
- React Native & Expo SDK 54
- React Navigation (Stack)
- Zustand (State Management)
- Expo Media Library & Background Fetch
- UI: Custom Dark Theme, Animated Components

**Backend (`/api`)**
- Laravel
- SQLite Database
- OpenRouter API (`nvidia/nemotron-nano-12b-v2-vl:free`) for Vision AI

---

## ✨ Features

### Phase 1: Backend Core (Pre-existing)
- **RESTful API**: Endpoints to list, upload, and delete screenshots.
- **AI Integration**: The `GeminiService` takes base64 images and prompts OpenRouter's vision model to extract a summary, category, tags, and text.
- **Local Storage**: Saves actual image files in Laravel's `storage/app/public/screenshots`.
- **Database**: SQLite table holding all AI-extracted metadata.

### Phase 2: Mobile Experience (What we built together)
- **Polished Dark UI**: iOS-inspired dark mode with smooth animations and dynamic category badge colors.
- **Onboarding Flow**: First-launch screen that beautifully asks for Photo Library permissions.
- **Real-Time Auto-Sync**: Uses `MediaLibrary.addListener` to instantly detect and upload screenshots taken while the app is open.
- **Background Auto-Sync**: Uses `expo-background-fetch` to sync screenshots taken while the app is closed (runs every ~15 mins).
- **Initial Sync**: Automatically pulls the 10 most recent screenshots from the gallery on the very first launch.
- **Interactive Feed**: Cards displaying thumbnail images, AI summaries, and swipe/long-press to delete.
- **Search & Filters**: Slide-in animated search bar and horizontal category pills (Shopping, Food, Finance, etc.).
- **Detail Screen**: Full-screen image viewer showcasing the AI summary, extracted raw text, and generated tag chips.
- **Manual Upload**: A floating action button (FAB) to pick past images from the gallery manually.

---

## 🚀 How to Run the App

Open two terminal windows.

### 1. Start the Laravel Backend
```bash
cd api
php artisan serve --host=0.0.0.0 --port=8000
```
> **Note:** Ensure your phone and computer are on the same Wi-Fi network. The API URL in the app is hardcoded to `http://192.168.1.38:8000`. If your computer's IP changes, update `baseURL` in `/app/src/services/api.js` and `IMAGE_BASE` in the screens.

### 2. Start the Expo Frontend
```bash
cd app
npx expo start --clear
```
> Scan the QR code using the **Expo Go** app on your physical Android device.

---

## 🔧 Useful Commands for Manipulation & Testing

### Resetting the Database (Backend)
If you want to completely wipe all saved screenshots and AI data from the database:
```bash
cd api
php artisan migrate:fresh
```

### Deleting Saved Image Files (Backend)
To delete the actual image files saved on the server:
```bash
cd api
find storage/app/public/screenshots -type f -delete
```

### Simulating a "Fresh Install" (Frontend)
To make the app think it was just installed (which will show the Onboarding screen again and trigger the Initial Sync of your last 10 screenshots):

**Method A: Change the Storage Keys (Recommended for Dev)**
1. Open `/app/src/utils/storage.js`.
2. Change the string names in the `KEYS` object slightly (e.g., add `_v3` to the end).
```javascript
const KEYS = {
  HAS_ONBOARDED: '@screenshot_memory/has_onboarded_v3',
  LAST_CHECKED: '@screenshot_memory/last_checked_v3',
};
```
3. Save the file and press `R, R` in the Expo terminal to reload.

**Method B: Clear Expo Go Data (On your Phone)**
1. Go to your Android **Settings** > **Apps** > **Expo Go**.
2. Tap **Storage** > **Clear Data**.
3. Re-scan the QR code to open the app. All local AsyncStorage will be wiped.
