interface ProfileBioSectionProps {
  bio: string;
  onBioChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
}

export default function ProfileBioSection({
  bio,
  onBioChange,
  maxLength = 500,
}: ProfileBioSectionProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Bio
      </label>
      <textarea
        value={bio}
        onChange={onBioChange}
        placeholder="Tell us about yourself..."
        rows={6}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
      />
      <p className="text-xs text-gray-500 mt-1">
        {bio.length} / {maxLength} characters
      </p>
    </div>
  );
}
