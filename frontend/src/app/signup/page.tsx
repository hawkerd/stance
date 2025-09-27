"use client";

import AuthLayout from "@/components/AuthLayout";
import AuthCard from "@/components/AuthCard";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Stance</h1>
        <p className="text-center text-gray-500 mb-6">Create your account</p>
        <SignupForm />
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            Sign in
          </a>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
