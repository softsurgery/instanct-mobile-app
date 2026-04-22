# Instanct Mobile App

A modern, cross-platform mobile application built with React Native and Expo for connecting professionals and exploring opportunities.

## 📱 Features

- **Authentication** - Secure user authentication and session management
- **Profile Management** - Create and manage user profiles with photos and information
- **Network Discovery** - Explore and connect with professionals in your area
- **Messaging** - Real-time chat with networking contacts
- **Notifications** - Push notifications and in-app alerts
- **Location Services** - Map-based discovery of nearby professionals
- **Bookmarks** - Save and organize interesting profiles
- **Sessions** - Schedule and manage professional sessions
- **Experience & Education** - Showcase professional background
- **Feedback System** - Rate and provide feedback on interactions
- **Multi-language Support** - Built-in internationalization support
- **Responsive Design** - Optimized for both iOS and Android

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.5 with Expo 54.0.32
- **Navigation**: Expo Router for file-based routing
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Validation**: Zod
- **Icons**: Tabler Icons, Lucide React Native
- **Animations**: Lottie, React Native Reanimated
- **Maps**: React Native Maps with clustering
- **Localization**: i18next + react-i18next
- **Storage**: AsyncStorage
- **Real-time**: Socket.io client
- **UI Components**: React Native Primitives

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio or Android SDK

### Installation

1. **Clone and install dependencies**

   ```bash
   yarn install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with the necessary API endpoint configuration.

3. **Start the development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start Expo dev client with development build
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset project to initial state

## 📁 Project Structure

```
src/
├── app/                  # Expo Router screens and layouts
│   ├── _layout.tsx      # Root layout
│   ├── index.tsx        # Home screen
│   ├── auth/            # Authentication screens
│   └── main/            # Main app screens
├── api/                 # API client integration
│   ├── auth.ts          # Authentication endpoints
│   ├── user.ts          # User endpoints
│   ├── chat/            # Chat/messaging endpoints
│   ├── axios.ts         # Axios configuration
│   └── ...
├── components/          # Reusable UI components
│   ├── auth/            # Auth-related components
│   ├── chat/            # Chat components
│   ├── map/             # Map components
│   ├── profile/         # Profile components
│   ├── ui/              # Basic UI primitives
│   └── ...
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
├── i18n/                # Internationalization configuration
└── assets/              # Images, fonts, lottie files
```

## 🏗️ Key Architecture Patterns

### State Management

Uses Zustand for global state management with persistence:

- `useAuthStore` - Authentication state
- `useUserStore` - User profile information
- `useSessionStore` - Session management
- And more specific stores for different features

### API Integration

- Centralized Axios instance with interceptors
- API clients organized by domain/feature
- React Query for server state and caching

### Navigation

File-based routing with Expo Router:

- Automatic route generation from file structure
- Deep linking support
- Tab navigation and stack navigation

### UI Components

Built with React Native Primitives:

- Customizable UI components
- Tailwind CSS styling via NativeWind
- Theme support

## 📍 Platform-Specific Setup

### Android

```bash
npm run android
```

See [ANDROID_MAPS_FIX.md](docs/ANDROID_MAPS_FIX.md) for maps integration setup.

### iOS

```bash
npm run ios
```

### Web

```bash
npm run web
```

## 🌍 Internationalization

The app supports multiple languages through i18next configuration in `i18n/`. Add new language resources in `i18n/locales/`.

Usage in components:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('key.path')}</Text>;
}
```

## 🔐 Authentication

User authentication is managed through:

- JWT-based token storage in AsyncStorage
- Auth store for state persistence
- Automatic token refresh on session expiry
- Protected routes via Expo Router

## 📡 API Integration

API requests are configured in `/api/axios.ts` with:

- Automatic token attachment
- Error handling and response interceptors
- Support for file uploads
- Configurable base URL

## 🐛 Troubleshooting

### Common Issues

- **Metro bundler errors**: Run `npm run reset-project`
- **Navigation issues**: Clear Expo cache with `expo start -c`
- **Maps not showing**: See [ANDROID_MAPS_FIX.md](docs/ANDROID_MAPS_FIX.md)
- **AsyncStorage errors**: Ensure persistence setup is correct

## 🤝 Contributing

Please follow the existing code style and structure when contributing. Run linting before submitting:

```bash
npm run lint
```

## 📄 License

This project is part of the Instanct ecosystem.
