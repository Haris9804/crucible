export default function PixelSkull({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated", flexShrink: 0 }}
    >
      <rect x="3" y="1" width="10" height="8" fill="#00ff41" />
      <rect x="2" y="3" width="12" height="6" fill="#00ff41" />
      <rect x="4" y="9" width="3" height="3" fill="#00ff41" />
      <rect x="9" y="9" width="3" height="3" fill="#00ff41" />
      <rect x="5" y="11" width="6" height="2" fill="#00ff41" />
      <rect x="4" y="4" width="3" height="3" fill="#020b06" />
      <rect x="9" y="4" width="3" height="3" fill="#020b06" />
      <rect x="7" y="7" width="2" height="2" fill="#020b06" />
    </svg>
  );
}