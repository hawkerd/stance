interface SaveCancelButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}

export default function SaveCancelButtons({
  onSave,
  onCancel,
  saveLabel = "Save Changes",
}: SaveCancelButtonsProps) {
  return (
    <div className="flex gap-3 pt-6 border-t border-gray-200">
      <button
        onClick={onCancel}
        className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 rounded-lg font-semibold transition shadow-sm"
      >
        {saveLabel}
      </button>
    </div>
  );
}
