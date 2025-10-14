import { Button } from "antd";

/**
 *
 * --------------------------------------
 * Reusable gradient-styled button built on Ant Design's <Button>.
 *
 * Responsibilities:
 *  Provides consistent gradient styling across the app
 *  Handles hover glow transitions
 *  Supports AntD props like block, loading, disabled, and htmlType
 *
 * Props:
 * - icon: React node (optional)
 * - text: string → button label
 * - onClick: function → click handler
 * - type: AntD button type (default: "primary")
 * - style: custom inline style overrides
 * - block: boolean → full width
 * - loading: boolean → AntD spinner state
 * - disabled: boolean → disables button + hover
 * - htmlType: string → form type ("button", "submit", etc.)
 */
export default function GradientButton({
  icon,
  text,
  onClick,
  type = "primary",
  style = {},
  block = false,
  loading = false,
  disabled = false,
  htmlType,
}) {
  const baseGradient = "linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)";
  const hoverGradient = "linear-gradient(90deg, #60a5fa, #3b82f6, #22d3ee)";
  const disabledColor = "#d9d9d9"; // default Ant Design gray

  // --- Hover effects ---
  const handleMouseEnter = (e) => {
    if (disabled) return;
    e.currentTarget.style.background = hoverGradient;
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.45)";
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    e.currentTarget.style.background = baseGradient;
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.35)";
  };

  // --- Render ---
  return (
    <Button
      type={type}
      icon={icon}
      htmlType={htmlType}
      onClick={onClick}
      block={block}
      loading={loading}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: disabled ? disabledColor : baseGradient,
        border: "none",
        color: disabled ? "#999" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 2px 8px rgba(59,130,246,0.35)",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {text}
    </Button>
  );
}
