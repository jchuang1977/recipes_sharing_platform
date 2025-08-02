# RecipeShare - Recipe Sharing Platform

A modern web application for sharing and discovering delicious recipes from around the world. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## Features

### 🔐 Authentication & Profiles
- **User Registration & Login**: Secure authentication with Supabase Auth
- **Profile Management**: Complete user profiles with customizable information
- **Profile Fields**: Username, full name, bio, location, website, and social links
- **Public Profiles**: View other users' profiles at `/user/[username]`

### 📝 Recipe Management
- **Recipe Upload**: Upload recipes with images, ingredients, and instructions
- **Recipe Display**: Beautiful recipe cards with cooking time and difficulty
- **My Recipes**: Personal dashboard showing all uploaded recipes
- **Recipe Categories**: Organize recipes by difficulty level

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Built-in dark/light theme support
- **Navigation**: Clean navigation with profile and recipe links
- **Loading States**: Smooth loading experiences throughout the app

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, React 19
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe_sharing_platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase dashboard
   - Navigate to the SQL editor
   - Run the contents of `database-setup.sql` to create tables and policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### User Profiles Table
```sql
user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  social_links JSONB,
  preferences JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Recipes Table
```sql
recipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  image_url TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  cooking_time INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Project Structure

```
recipe_sharing_platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── profile/           # Profile management
│   ├── user/[username]/   # Public user profiles
│   └── api/               # API routes
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   └── recipes/      # Recipe-related components
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── database-setup.sql    # Database schema
└── README.md
```

## Key Features Implementation

### Profile System
- **Automatic Profile Creation**: Profiles are automatically created when users sign up
- **Profile Validation**: Comprehensive validation for usernames, URLs, and form data
- **Profile Display**: Public and private profile views with social links
- **Profile Editing**: Full profile management with real-time updates

### Authentication Flow
- **Sign Up**: Collects username and full name during registration
- **Sign In**: Secure login with email/password
- **Session Management**: Automatic session handling with Supabase
- **Protected Routes**: Middleware-based route protection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@recipeshare.com or create an issue in the repository.
