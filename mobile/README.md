# IPEACE Mobile App

A React Native mobile application for IPEACE Professional Consulting, built with Expo.

## Features

- **Home Screen**: Overview of IPEACE services with quick stats and navigation
- **Services Screen**: Detailed view of all consulting services offered
- **Contact Screen**: Contact form and office information
- **AI Chat Screen**: Interactive chatbot for Zimbabwe business law queries
- **Consultation Booking**: Schedule personalized consultations
- **Bilingual Support**: English and Shona language support
- **Responsive Design**: Optimized for both iOS and Android devices

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on specific platforms:
   ```bash
   npm run ios     # Run on iOS simulator
   npm run android # Run on Android emulator
   npm run web     # Run in web browser
   ```

### Configuration

1. **API Configuration**: Update the API base URL in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-api-domain.com';
   ```

2. **App Configuration**: Modify `app.json` to update app name, bundle identifiers, and other settings.

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── services/           # API and external services
│   ├── locales/            # Translation files
│   ├── providers/          # Context providers
│   └── theme.ts            # App theme configuration
├── assets/                 # Images, icons, and other assets
├── App.tsx                 # Main app component
└── package.json           # Dependencies and scripts
```

## Key Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **TanStack Query**: Data fetching and caching
- **i18next**: Internationalization
- **TypeScript**: Type safety

## Features Overview

### Home Screen
- Hero section with IPEACE branding
- Service overview cards
- Quick action buttons
- Language toggle
- Key statistics display

### AI Chat Screen
- Real-time chat interface
- Integration with OpenAI API
- Suggested questions
- Session-based conversations
- Zimbabwe business law expertise

### Contact & Consultation
- Contact form with validation
- Office information with clickable actions
- Consultation booking system
- Date and time selection
- Service type selection

### Multilingual Support
- English and Shona translations
- Dynamic language switching
- Localized content throughout the app

## Building for Production

### iOS
1. Configure your Apple Developer account in Expo
2. Build the app: `expo build:ios`
3. Submit to App Store via Expo or manually

### Android
1. Configure your Google Play Console account
2. Build the app: `expo build:android`
3. Upload to Google Play Store

## API Integration

The mobile app connects to the same backend API as the web application:

- **Contact Form**: `POST /api/contact`
- **AI Chat**: `POST /api/chat`
- **Consultation Booking**: `POST /api/consultations`

Ensure your backend server is configured to accept requests from mobile clients and has proper CORS settings.

## Customization

### Branding
- Update colors in `src/theme.ts`
- Replace app icons in `assets/`
- Modify splash screen in `assets/splash.png`

### Content
- Update translations in `src/locales/`
- Modify service information in screen components
- Customize form fields and validation

## Deployment

The app can be deployed using:
- **Expo Application Services (EAS)**: Recommended for managed workflow
- **Manual Build**: For bare React Native projects
- **Over-the-Air Updates**: Using Expo Updates for quick deployments

## Support

For technical support or questions about the mobile app, contact the development team or refer to the main project documentation.