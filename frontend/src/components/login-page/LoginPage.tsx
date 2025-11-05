"use client";

import LoginForm from "@/components/login-page/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 tracking-tight">Stance</h1>
        <p className="text-center text-gray-500 mb-6">Sign in to your account</p>
        <LoginForm />
        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-purple-600 hover:underline font-semibold">Sign up</a>
        </div>
      </div>
    </main>
  );
}
