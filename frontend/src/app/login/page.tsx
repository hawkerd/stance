"use client";

import AuthLayout from "@/components/AuthLayout";
import AuthCard from "@/components/AuthCard";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Stance</h1>
        <p className="text-center text-gray-500 mb-6">Sign in to your account</p>
        <LoginForm />
        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-purple-600 hover:underline">
            Sign up
          </a>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
