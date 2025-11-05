import React, { useRef, useState, useEffect } from "react";

interface VerticalRatingProps {
  value: number | null; // user rating 1-5 or null
  averageRating: number | null; // 1-5 or null
  onChange: (newValue: number | null) => void;
}

const VerticalRating: React.FC<VerticalRatingProps> = ({ value, averageRating, onChange }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [tempValue, setTempValue] = useState<number | null>(value);

  const levels = 5;

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const calculateRatingFromY = (clientY: number) => {
    if (!barRef.current) return null;
    const rect = barRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    let percent = 1 - Math.min(Math.max(relativeY / rect.height, 0), 1);
    const snappedLevel = Math.round(percent * (levels - 1)) + 1;
    return Math.min(Math.max(snappedLevel, 1), levels);
  };

  const handleDrag = (clientY: number) => {
    const newRating = calculateRatingFromY(clientY);
    if (newRating !== null) setTempValue(newRating);
  };

  const commitChange = () => {
    onChange(tempValue);
    setDragging(false);
  };

  const handleMouseDown = (clientY: number) => {
    setDragging(true);
    handleDrag(clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => dragging && handleDrag(e.clientY);
    const handleMouseUp = () => dragging && commitChange();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, tempValue]);

  return (
    <div
      ref={barRef}
      className="relative w-12 h-40 bg-gray-200 rounded-lg cursor-pointer select-none mx-auto"
      onMouseDown={(e) => handleMouseDown(e.clientY)}
    >

      {/* User rating fill (behind) */}
      <div
        className="absolute bottom-0 left-0 w-full bg-purple-300 rounded-lg transition-all"
        style={{
          height: `${((tempValue ?? 0) / levels) * 100}%`,
          zIndex: 1,
        }}
      />

      {/* Average rating notch (in front) */}
      {value !== null && averageRating !== null && (() => {
        const barHeight = barRef.current?.getBoundingClientRect().height ?? 160;
        const percent = (averageRating ?? 0) / levels; // 1-5 scaled to 0-1
        const bottomPx = percent * barHeight;
        return (
          <div
            className="absolute left-0 w-full flex items-center justify-center pointer-events-none transition-all duration-300"
            style={{ bottom: `${bottomPx - 1}px`, height: "2px", zIndex: 2 }}
          >
            <div className="w-14 h-1 bg-purple-700 rounded-full shadow" />
          </div>
        );
      })()}
    </div>
  );
};

export default VerticalRating;
