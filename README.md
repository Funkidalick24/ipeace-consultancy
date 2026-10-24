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

## Testing

Run the test suite with:
```bash
npm test
```

Tests use `mongodb-memory-server` (no external MongoDB needed) and cover auth and consultation booking flows.

## Deployment

### Docker (recommended)

```bash
cp .env.example .env
# Edit .env with production values

docker compose up -d
```

This starts the app on port 5000 with a managed MongoDB instance.

### Manual production deployment

```bash
cp .env.example .env
# Edit .env with production values

npm ci --legacy-peer-deps
npm run build
npm run start
```

Use a process manager like PM2 for production:
```bash
npm install -g pm2
pm2 start dist/index.js --name ipeace
pm2 save
pm2 startup
```

### Cloud platforms

**Railway / Render / Fly.io**: All support Docker-based deploys. Point the build at the `Dockerfile`, set env vars from `.env.example`, and provision a MongoDB addon.

**Environment variables**: Copy `.env.example` and fill in all required values. `JWT_SECRET` must be at least 32 characters.

### Reverse proxy

Place nginx or Caddy in front of the Node process for TLS termination:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```