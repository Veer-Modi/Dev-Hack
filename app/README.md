# Real-Time Incident Reporting and Resource Coordination Platform

A comprehensive emergency management platform that enables real-time incident reporting, verification, and coordination between citizens, responders, and administrators. The platform includes advanced features for emergency services integration, predictive analytics, community engagement, and comprehensive feedback mechanisms.

## Features

### Core Functionality
- **Real-time Incident Reporting**: Citizens can report incidents with location, description, and media
- **Verification System**: Community voting and admin verification process
- **Role-based Access Control**: Different permissions for citizens, responders, and admins
- **Live Dashboard**: Real-time updates and status tracking
- **Map Integration**: Visual representation of incidents with geolocation

### Advanced Features
- **Emergency Services Integration**: Automated alerts to emergency contacts via Twilio and email
- **AI-Powered Predictions**: Incident prediction and hotspot mapping using historical data
- **Gamification**: Points, badges, leaderboards, and user engagement metrics
- **Multi-language Support**: Internationalization with English and Spanish
- **Accessibility Features**: High contrast mode, font size adjustment, and voice input
- **Push Notifications**: Real-time alerts via Firebase Cloud Messaging
- **Cloud Media Storage**: Secure media uploads via Cloudinary
- **Post-Incident Surveys**: Feedback collection and analytics

### Frontend Enhancements
- **i18n Internationalization**: Complete translation support with language switcher component
- **Accessibility Context**: High contrast mode, font size adjustment, and voice input capabilities
- **Hotspot Visualization**: Enhanced Leaflet map with incident hotspot rendering
- **Firebase Integration**: Push notification service with permission handling
- **Enhanced API Library**: Comprehensive TypeScript interfaces for all new features
- **Language Switcher Component**: UI component for switching between supported languages
- **Real-time Updates**: WebSocket integration for all new features
- **Media Upload Components**: File upload handling with validation and progress indicators

### Recent Fixes
- **Server Import Issues**: Fixed import/export issues in server routes
- **Survey Route Issues**: Corrected parameter name typos and export placement
- **Incident Resolution**: Added proper survey triggering when incidents are resolved

## Tech Stack

### Frontend
- React.js with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for UI components
- Leaflet for map integration
- Socket.io-client for real-time communication
- i18next for internationalization
- Firebase for push notifications

### Backend
- Node.js with Express.js
- MongoDB Atlas for database
- Socket.io for real-time communication
- JWT for authentication
- Cloudinary for media storage
- Twilio for SMS notifications
- Nodemailer for email alerts
- Firebase Admin SDK for push notifications

## Project Structure

```
app/
├── public/                 # Static assets
├── server/                 # Backend server
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication middleware
│   │   └── lib/            # Utility functions
│   └── tests/              # Test files
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── lib/                # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── data/               # Mock data
├── package.json            # Dependencies
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account (for media storage)
- Firebase project (for push notifications)
- Twilio account (for SMS alerts)

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_REPOSITORY_URL>
   cd <REPOSITORY_NAME>
   ```

2. Install dependencies:
   ```sh
   cd app
   npm install
   cd server
   npm install
   ```

3. Set up environment variables:
   ```sh
   # Frontend (.env)
   VITE_API_URL=http://localhost:3001
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key
   
   # Backend (.env)
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:8081
   PORT=3001
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   EMERGENCY_PHONE=emergency_contact_phone
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   EMERGENCY_EMAIL=emergency_contact_email
   ```

4. Start the development servers:
   ```sh
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend server
   cd app
   npm run dev
   ```

## API Endpoints

### Incidents
- `GET /api/incidents` - Get all incidents with filters
- `POST /api/incidents` - Create a new incident
- `GET /api/incidents/:id` - Get incident details
- `PATCH /api/incidents/:id/status` - Update incident status
- `POST /api/incidents/:id/vote` - Vote on an incident
- `POST /api/incidents/:id/escalate` - Escalate to emergency services

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/analytics/incidents` - Get incident analytics
- `GET /api/analytics/hotspots` - Get incident hotspots
- `POST /api/analytics/predict` - Predict incidents for location
- `GET /api/analytics/users` - Get user analytics

### Leaderboards
- `GET /api/leaderboards/top-reporters` - Get top reporters
- `GET /api/leaderboards/profile/:userId` - Get user profile
- `GET /api/leaderboards/stats/:userId` - Get user stats
- `GET /api/leaderboards/badges` - Get available badges

### Media
- `POST /api/media/upload` - Upload media file
- `POST /api/media/upload-multiple` - Upload multiple files
- `DELETE /api/media/delete/:publicId` - Delete media
- `GET /api/media/details/:publicId` - Get media details

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to notifications
- `POST /api/notifications/unsubscribe` - Unsubscribe from notifications
- `GET /api/notifications/subscriptions/:userId` - Get user subscriptions
- `POST /api/notifications/send` - Send notification (admin only)
- `GET /api/notifications/preferences/:userId` - Get notification preferences
- `PATCH /api/notifications/preferences/:userId` - Update notification preferences

### Surveys
- `POST /api/surveys` - Submit a survey
- `GET /api/surveys/incident/:incidentId` - Get survey for incident
- `GET /api/surveys/incident/:incidentId/stats` - Get survey statistics
- `GET /api/surveys/user/:userId` - Get user's surveys

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_VAPID_KEY` - Firebase VAPID key

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret for authentication
- `CORS_ORIGIN` - Allowed origins for CORS
- `PORT` - Server port
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `EMERGENCY_PHONE` - Emergency contact phone
- `EMAIL_USER` - Email account username
- `EMAIL_PASS` - Email account password
- `EMERGENCY_EMAIL` - Emergency contact email

## Deployment

### Backend
The backend can be deployed to platforms like Render, Heroku, or AWS. Make sure to set all required environment variables.

### Frontend
The frontend can be deployed to platforms like Vercel, Netlify, or GitHub Pages.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
