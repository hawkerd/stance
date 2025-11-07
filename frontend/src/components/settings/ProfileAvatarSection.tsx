interface ProfileAvatarSectionProps {
  username: string;
  avatarUrl: string;
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileAvatarSection({
  username,
  avatarUrl,
  avatarPreview,
  onAvatarChange,
}: ProfileAvatarSectionProps) {
  const currentAvatar = avatarPreview || avatarUrl;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Profile Picture
      </label>
      <div className="flex items-center gap-6">
        {/* Avatar Preview */}
        <div className="flex-shrink-0">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Profile avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow border-4 border-purple-100">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div>
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-semibold text-sm transition inline-block">
              Change Picture
            </div>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
