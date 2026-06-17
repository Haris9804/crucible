

export default function CyberButton({
  children,
  onClick,
  icon = null,          // 👈 pass icon
  iconPosition = "left", // "left" | "right"
  disabled = false,
  fullWidth = false,
  className = "",
}) {
  return (
    <button
      className={`cyber-btn ${fullWidth ? "w-full justify-center" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* LEFT ICON */}
      {icon && iconPosition === "left" && icon}

      {children}

      {/* RIGHT ICON */}
      {icon && iconPosition === "right" && icon}
    </button>
  );
}