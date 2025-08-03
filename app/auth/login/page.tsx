import Link from "next/link";
import { SignInForm } from "../../../src/components/auth/SignInForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4 py-12">
      <SignInForm />
      <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-green-600 hover:underline">Sign up</Link>
      </div>
    </div>
  );
} 