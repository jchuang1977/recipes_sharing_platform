import Link from "next/link";
import { SignUpForm } from "../../../src/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4 py-12">
      <SignUpForm />
      <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
        Already have an account?{' '}
        <Link href="/login" className="text-green-600 hover:underline">Log in</Link>
      </div>
    </div>
  );
} 