# 📝 TodoMaster

A beautiful and functional Todo application built with React Native, Expo, and Supabase.

## 🌟 Features

- ✅ Create, update, and delete tasks
- 📋 Organize tasks by categories
- 🗓️ View today's and upcoming tasks
- 🔔 Set reminders for tasks
- 🎨 Customize categories with colors and icons
- 📱 Beautiful, cross-platform UI that works on iOS, Android, and Web
- 💎 Premium subscription plans with advanced features
- 🔄 Multi-device data synchronization
- 📊 Task statistics and productivity analytics

## 🛠️ Technologies Used

- **Frontend**: React Native, Expo
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Query, Zustand
- **UI**: Custom components with thoughtful design
- **Navigation**: Expo Router
- **Data Fetching**: Supabase JS Client with real-time subscriptions
- **Payment Integration**: Mock payment flow (real integration planned)

## 📱 App Structure

The application consists of the following main sections:

- **Task Management**: Core functionality for creating and managing tasks
- **Profile**: User profile information and settings management
- **Premium Plan**: Subscription options and premium features showcase
- **Help & Support**: FAQs and user assistance options

## 📋 Prerequisites

- Node.js (v14 or newer)
- Yarn or npm
- Expo CLI
- A Supabase account and project

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

### 2. Set up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Import the database schema from `postgresql/schema.sql` in the SQL Editor
3. Run the seed data script from `scripts/seed-data.sql`
4. Copy your Supabase URL and anonymous key from the API settings

### 3. Configure the app

Update the Supabase configuration in `lib/supabase.ts` with your project URL and anon key:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 4. Install dependencies and run

```bash
# Install dependencies
yarn install

# Run the app
yarn start
```

## 📱 App Configuration

The app uses a centralized configuration system to manage all basic information:

### Configuration File

App information is stored in the `app/config/app-info.ts` file, which includes:

- **Basic Info**: App name, version number, build number, and release date
- **Company Info**: Company name and copyright year
- **Contact Info**: Support email, website, and social media links
- **Legal Links**: URLs for privacy policy and terms of service
- **Subscription Plans**: Pricing and details for different subscription tiers

To update app information, simply modify this configuration file, and changes will automatically apply throughout the app.

```typescript
// Example of app/config/app-info.ts
export const APP_INFO = {
  NAME: 'TodoMaster',
  VERSION: '2.1.0',
  BUILD_NUMBER: '210',
  // ... other configuration
};
```

## 📁 Project Structure

```
todo-app/
├── app/ - Expo Router app directory
│   ├── (tabs)/ - Main tab pages
│   ├── (profile)/ - Profile-related pages
│   └── config/ - App configuration files
├── assets/ - Images and other static assets
├── components/ - Reusable UI components
├── hooks/ - Custom React hooks
├── lib/ - Utility functions and Supabase client
├── postgresql/ - Database schema
├── store/ - State management (Zustand)
└── services/ - API service functions
```

## 🔒 Database Design

The TodoMaster app uses a PostgreSQL database (via Supabase) with the following key features:

- **Enum Types**: For task priorities, statuses, and action types
- **JSONB Data Type**: For storing activity log details
- **Trigger Functions**: For automatically updating record timestamps
- **Relational Model**: Clear relationships between users, tasks, and categories

Main data tables include:

- **users**: User account information
- **user_settings**: User preferences
- **categories**: Task categories
- **tasks**: Main task data
- **subtasks**: Subtask data
- **attachments**: Task attachments
- **reminders**: Task reminder settings

## 🧪 Default Test Account

The seed script creates a demo user with the following credentials:

- **Email**: demo@example.com
- **Password**: demo123

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📅 Development Roadmap

- [ ] Implement real payment integration
- [ ] Add more task statistics and analytics
- [ ] Implement team collaboration features
- [ ] Add custom themes and more UI customization options
- [ ] Offline support and data synchronization improvements
