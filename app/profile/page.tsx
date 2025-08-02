import { ProfileForm } from '../../src/components/auth/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
              Update your profile information and preferences
            </p>
          </div>
          
          <ProfileForm />
        </div>
      </div>
    </div>
  );
} 