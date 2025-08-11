# LegalDocConnect

A professional business consulting website with enhanced navigation features.

## Features Implemented

1. **Logo Navigation**: Added a logo image in the header that links to the home page
2. **Video Demo Popup**: Implemented a YouTube video popup for the "Watch Demo" button

## How to Run the Application

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation
1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000` (or the next available port).

### Building for Production
To create a production build:
```bash
npm run build
```

To run the production build locally:
```bash
npm run start
```

## Project Structure

```
.
├── client/                 # Frontend files
│   ├── public/             # Static assets (images, icons, etc.)
│   └── src/                # React source code
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── locales/        # Translation files
│       └── ...
├── server/                 # Backend files
├── shared/                 # Shared code between client and server
├── package.json            # Project dependencies and scripts
└── ...
```

## Key Components

### VideoModal Component
Located at `client/src/components/layout/video-modal.tsx`, this is a reusable component for displaying YouTube videos in a modal dialog.

### Header Component
Located at `client/src/components/layout/header.tsx`, this component now includes a logo image that links to the home page.

### Hero Section
Located at `client/src/components/sections/hero.tsx`, this component now uses the VideoModal for the "Watch Demo" button.

## Customization

### Updating the Logo
Replace `client/public/logo.png` with your own logo image.

### Updating the Video URL
In `client/src/components/sections/hero.tsx`, update the `videoUrl` prop of the VideoModal component with your YouTube video URL.

## Technologies Used

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for data fetching
- i18next for internationalization
- Radix UI for accessible UI components