# LegalDocConnect

A professional business consulting website with enhanced navigation features.

## Features Implemented

1. **Logo Navigation**: Added a logo image in the header that links to the home page
2. **Video Demo Popup**: Implemented a YouTube video popup for the "Watch Demo" button
3. **Dual Email System**: Automated email notifications for contact forms and consultation bookings
   - Customer confirmation emails with booking details
   - Company notification emails with action items
   - Professional HTML email templates
   - Configurable SMTP settings

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

### Email Configuration
The application includes a dual email system for contact forms and consultation bookings.

1. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your email service credentials
   ```

2. **Required Environment Variables**:
   - `SMTP_HOST`: Your SMTP server (e.g., smtp.gmail.com)
   - `SMTP_PORT`: SMTP port (587 for TLS, 465 for SSL)
   - `SMTP_USER`: Your email address
   - `SMTP_PASS`: Your email password or app password
   - `FROM_EMAIL`: Sender email address
   - `COMPANY_EMAIL`: Company notification email

3. **Email Templates**:
   - Located in `server/templates/`
   - HTML templates for professional email formatting
   - Customizable with your branding

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