type SettingsTab = "account" | "profile";

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => onTabChange("account")}
        className={`flex-1 px-6 py-2.5 rounded-md font-semibold transition ${
          activeTab === "account"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Account
      </button>
      <button
        onClick={() => onTabChange("profile")}
        className={`flex-1 px-6 py-2.5 rounded-md font-semibold transition ${
          activeTab === "profile"
            ? "bg-white text-purple-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Profile
      </button>
    </div>
  );
}
