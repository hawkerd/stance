import React, { useEffect } from "react";

interface StanceCreateModalProps {
  open: boolean;
  onClose: () => void;
  // Add more props as needed for multi-step, media, etc.
}

const StanceCreateModal: React.FC<StanceCreateModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Create Your Stance</h2>
        {/* Multi-step form content will go here */}
        <div className="text-gray-500 text-center py-8">Stance creation steps go here...</div>
      </div>
    </div>
  );
};

export default StanceCreateModal;
