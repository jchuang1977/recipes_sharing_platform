# Recipe Sharing Platform Setup Guide

## Database Setup

To fix the upload issues, you need to set up your Supabase database properly. Follow these steps:

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the SQL Editor

### 2. Run the Database Setup Script
- Copy the contents of `database-setup.sql`
- Paste it into the SQL Editor
- Click "Run" to execute the script

This will:
- Create the `recipes` table with the correct schema including `image_url` column
- Set up Row Level Security (RLS) policies
- Create the `images` storage bucket
- Set up storage policies for image uploads
- Create necessary indexes for performance

### 3. Verify Setup
After running the script, you should see:
- A `recipes` table in your database
- An `images` bucket in your storage
- Proper RLS policies applied

### 4. Test the Application
- Restart your development server: `npm run dev`
- Try uploading a recipe with an image
- The upload should now work without errors

## Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

If you still encounter issues:

1. **Check Storage Bucket**: Ensure the `images` bucket exists in your Supabase storage
2. **Check RLS Policies**: Verify that the storage policies are properly applied
3. **Check Database Schema**: Confirm the `recipes` table has the `image_url` column
4. **Check Environment Variables**: Ensure your Supabase credentials are correct

## Database Schema

The `recipes` table will have this structure:
- `id`: UUID (Primary Key)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `user_id`: UUID (Foreign Key to auth.users)
- `title`: Text (Required)
- `image_url`: Text (Optional)
- `ingredients`: Text Array
- `instructions`: Text Array
- `cooking_time`: Integer
- `difficulty`: Text (Easy/Medium/Hard)
- `description`: Text 