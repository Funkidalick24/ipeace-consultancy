# Microsoft Calendar Integration Setup Guide

This guide explains how to set up Microsoft Calendar integration for consultation bookings. This allows automatic availability checking and calendar event creation without requiring users to log in.

## Overview

The Microsoft Calendar integration provides:
- ✅ **Automatic availability checking** before booking consultations
- ✅ **Calendar event creation** when consultations are booked
- ✅ **No user authentication required** - uses application permissions
- ✅ **Real-time calendar synchronization**

## Prerequisites

1. **Microsoft Azure Account** - You need an Azure AD tenant
2. **Microsoft 365 Business Account** - For calendar access
3. **Admin Access** - To configure Azure AD applications

## Step 1: Create Azure AD Application

### 1.1 Access Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**

### 1.2 Register Application
```
Name: IPEACE Calendar Integration
Supported account types: Accounts in this organizational directory only
Redirect URI: Leave blank (we're using application permissions)
```

### 1.3 Configure API Permissions

1. Go to **API permissions** in your app registration
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Add these permissions:
   - `Calendars.ReadWrite` - Read and write calendars
   - `Calendars.ReadWrite.Shared` - Read and write shared calendars
   - `User.Read.All` - Read user profiles (for calendar access)

### 1.4 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
```
Description: Calendar Integration Secret
Expires: 24 months (recommended)
```
3. **IMPORTANT**: Copy the secret value immediately - you won't see it again!

### 1.5 Get Application Details

From your app registration, note these values:
- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Client Secret**: The value you copied in step 1.4

## Step 2: Create Shared Calendar

### 2.1 Create Calendar in Outlook
1. Open Outlook Web App
2. Click the calendar icon
3. Click **Add calendar** > **Create new calendar**
```
Name: IPEACE Consultations
Description: Shared calendar for consultation bookings
Color: Choose a distinctive color
```

### 2.2 Share the Calendar
1. Right-click the calendar
2. Select **Sharing and permissions**
3. Add your application/service account as a delegate with **Editor** permissions
4. Or share with your organization if using organizational accounts

### 2.3 Get Calendar ID
1. In Outlook Web App, right-click the calendar
2. Select **Calendar properties**
3. Copy the calendar ID from the URL or properties

## Step 3: Configure Environment Variables

Update your `.env` file with the values from Steps 1 and 2:

```env
# Microsoft Calendar Integration
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-directory-tenant-id
SHARED_CALENDAR_ID=your-calendar-id-or-primary
CALENDAR_TIMEZONE=Africa/Harare
DEFAULT_EVENT_DURATION=60
CALENDAR_REMINDER_MINUTES=15
```

## Step 4: Install Required Packages

```bash
npm install @microsoft/microsoft-graph-client @azure/identity
```

## Step 5: Test the Integration

### 5.1 Start Your Application
```bash
npm run dev
```

### 5.2 Test Calendar Connection
The application will log connection status on startup:
```
✅ Microsoft Calendar service initialized
```

### 5.3 Test Booking Flow
1. Try booking a consultation through your frontend
2. Check that:
   - Availability is checked before booking
   - Calendar event is created if booking succeeds
   - Email notifications are sent

### 5.4 Verify Calendar Events
1. Open Outlook Web App
2. Check your shared calendar for new events
3. Events should appear with:
   - Client name and details
   - Service type and consultation type
   - Proper timing and location

## Step 6: Troubleshooting

### Common Issues

#### 1. "Microsoft Calendar: Missing required environment variables"
**Solution**: Ensure all Microsoft environment variables are set in your `.env` file.

#### 2. "Error checking calendar availability"
**Cause**: Calendar permissions or authentication issues.
**Solution**:
- Verify API permissions in Azure AD
- Check client secret is correct
- Ensure calendar sharing permissions

#### 3. "Calendar event creation failed"
**Cause**: Calendar write permissions or calendar ID issues.
**Solution**:
- Verify `Calendars.ReadWrite` permission
- Check `SHARED_CALENDAR_ID` is correct
- Ensure calendar is shared with the application

#### 4. Time zone issues
**Solution**: Set `CALENDAR_TIMEZONE` to match your location (e.g., `Africa/Harare`)

### Debug Logging

The integration includes comprehensive logging:
- Calendar connection status
- Availability check results
- Event creation success/failure
- Error details for troubleshooting

## Step 7: Advanced Configuration

### Custom Event Templates

You can customize calendar event details by modifying the `generateEventDescription` method in `server/services/microsoft-calendar.ts`.

### Multiple Calendars

Support multiple calendars by:
1. Creating additional calendars in Outlook
2. Updating the service to select calendars based on service type
3. Configuring calendar IDs in environment variables

### Calendar Sharing

To allow users to subscribe to your consultation calendar:
1. Share the calendar publicly (if using Exchange Online)
2. Provide calendar URL for subscription
3. Users can add it to their personal calendars

## Security Considerations

- **Client Secret**: Store securely, never commit to version control
- **API Permissions**: Use minimal required permissions
- **Calendar Access**: Only share necessary calendars
- **Data Privacy**: Ensure compliance with data protection regulations

## Support

If you encounter issues:
1. Check the application logs for detailed error messages
2. Verify Azure AD configuration matches this guide
3. Test with Microsoft Graph Explorer: https://developer.microsoft.com/en-us/graph/graph-explorer
4. Review Microsoft Graph API documentation

## Next Steps

Once configured, your consultation booking system will:
- ✅ Check calendar availability in real-time
- ✅ Create calendar events automatically
- ✅ Send email confirmations with calendar details
- ✅ Maintain synchronization between bookings and calendar
- ✅ Provide professional calendar integration without user login

The integration is designed to fail gracefully - if calendar services are unavailable, bookings will still work with email notifications.