# 📝 Todo App

A beautiful and functional Todo application built with React Native, Expo, and Supabase.

## 🌟 Features

- ✅ Create, update, and delete tasks
- 📋 Organize tasks by categories
- 🗓️ View today's and upcoming tasks
- 🔔 Set reminders for tasks
- 🎨 Customize categories with colors and icons
- 📱 Beautiful, cross-platform UI that works on iOS, Android, and Web

## 🛠️ Technologies Used

- **Frontend**: React Native, Expo
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Query, React Context
- **UI**: Custom components with thoughtful design
- **Navigation**: Expo Router
- **Data Fetching**: Supabase JS Client with real-time subscriptions

## 📋 Prerequisites

- Node.js (v14 or newer)
- Yarn or npm
- Expo CLI
- A Supabase account and project

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Holmesen/todo-app.git
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

## 📱 Using the App

After starting the app, you can:

- View and filter tasks by categories
- Add new tasks
- Mark tasks as completed
- Set reminders for important tasks
- Create and manage custom categories

## 🧪 Default Test Account

The seed script creates a demo user with the following credentials:

- **Email**: demo@example.com
- **Password**: demo123

## 📁 Project Structure

```
todo-app/
├── app/ - Expo Router app directory
├── assets/ - Images and other static assets
├── components/ - Reusable UI components
├── context/ - React Context for state management
├── hooks/ - Custom React hooks
├── lib/ - Utility functions and Supabase client
├── postgresql/ - Database schema
├── scripts/ - Setup and utility scripts
└── services/ - API service functions
```

## 🧩 Key Components

- **TaskItem**: Displays a single task with priority, due time, and action buttons
- **TaskSection**: Groups tasks by section (Today, Upcoming)
- **ActionButton**: Category filter buttons with color and icon support
- **SearchBar**: Allows searching through tasks

## 🔄 State Management

The app uses React hooks for state management, with Supabase's real-time subscriptions to keep the UI in sync with the database.

## 🔒 Authentication

Authentication is managed through Supabase Auth, with support for email/password and OAuth providers.

## 📅 Future Enhancements

- Task sharing and collaboration
- Advanced filtering and sorting options
- Dark mode support
- Push notifications for reminders
- Offline support with data synchronization

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- Icons from [Font Awesome](https://fontawesome.com/)
- UI inspiration from various productivity apps
