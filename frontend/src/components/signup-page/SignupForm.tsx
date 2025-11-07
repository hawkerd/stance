"use client";

import { useState, useEffect } from "react";
import InputField from "@/components/InputField";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { UserService } from "@/service/UserService";

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const api = useAuthApi();
  const userService = new UserService();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Username availability checking
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Check username availability with debouncing
  useEffect(() => {
    // Don't check if username is empty
    if (!username) {
      setUsernameAvailable(null);
      setUsernameError(null);
      setUsernameChecking(false);
      return;
    }

    setUsernameChecking(true);
    setUsernameError(null);

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        const isTaken = await userService.isUsernameTaken(api, username);
        setUsernameAvailable(!isTaken);
        if (isTaken) {
          setUsernameError("Username is already taken");
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameError("Error checking username availability");
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [username, api]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (usernameAvailable === false) {
      setError("Please choose an available username");
      return;
    }

    setIsLoading(true);
    try {
      await signup(username, email, password, fullName);
      router.push("/home/"); // redirect after signup/login
    } catch (err) {
      setError("Signup failed. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField id="name" label="Full Name" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)}/>
      
      {/* Username with availability checking */}
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
          Username
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
              username
                ? usernameAvailable === false
                  ? "border-red-300 focus:ring-red-500"
                  : usernameAvailable === true
                  ? "border-green-300 focus:ring-green-500"
                  : "border-gray-300 focus:ring-purple-500"
                : "border-gray-300 focus:ring-purple-500"
            }`}
          />
          {username && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameChecking ? (
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : usernameAvailable === true ? (
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : usernameAvailable === false ? (
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : null}
            </div>
          )}
        </div>
        {username && usernameError && (
          <p className="text-xs text-red-600 mt-1">{usernameError}</p>
        )}
        {username && usernameAvailable === true && (
          <p className="text-xs text-green-600 mt-1">Username is available</p>
        )}
      </div>

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
