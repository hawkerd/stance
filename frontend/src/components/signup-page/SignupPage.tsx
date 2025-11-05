"use client";

import SignupForm from "@/components/signup-page/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 tracking-tight">Stance</h1>
        <p className="text-center text-gray-500 mb-6">Create your account</p>
        <SignupForm />
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-purple-600 hover:underline font-semibold">Sign in</a>
        </div>
      </div>
    </main>
  );
}
