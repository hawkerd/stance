"use client";

import { useState } from "react";
import InputField from "./InputField";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await signup(username, email, password, fullName);
      router.push("/dashboard"); // redirect after signup/login
    } catch (err) {
      setError("Signup failed. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField id="name" label="Full Name" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)}/>
      <InputField id="username" label="Username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)}/>
      <InputField id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}/>
      <InputField id="password" label="Password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
      <InputField id="confirmPassword" label="Confirm Password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
