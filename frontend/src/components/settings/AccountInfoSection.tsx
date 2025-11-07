interface AccountInfoSectionProps {
  username: string;
  email: string;
  fullName: string;
  originalUsername: string;
  usernameChecking: boolean;
  usernameAvailable: boolean | null;
  usernameError: string | null;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
}

export default function AccountInfoSection({
  username,
  email,
  fullName,
  originalUsername,
  usernameChecking,
  usernameAvailable,
  usernameError,
  onUsernameChange,
  onEmailChange,
  onFullNameChange,
}: AccountInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Username */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Username
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Enter your username"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
              username !== originalUsername
                ? usernameAvailable === false
                  ? "border-red-300 focus:ring-red-500"
                  : usernameAvailable === true
                  ? "border-green-300 focus:ring-green-500"
                  : "border-gray-300 focus:ring-purple-500"
                : "border-gray-300 focus:ring-purple-500"
            }`}
          />
          {username !== originalUsername && (
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
        {username !== originalUsername && usernameError && (
          <p className="text-xs text-red-600 mt-1">{usernameError}</p>
        )}
        {username !== originalUsername && usernameAvailable === true && (
          <p className="text-xs text-green-600 mt-1">Username is available</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
