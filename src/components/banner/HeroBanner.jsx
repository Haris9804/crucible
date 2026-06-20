import { useEffect, useRef, useState } from "react";
import PixelSkull from "./PixelSkull";

function cornerStyle(pos) {
  const base = {
    position: "absolute",
    width: "12px",
    height: "12px",
    borderColor: "#A1FFC2",
    borderStyle: "solid",
    zIndex: 11,
  };

  const positions = {
    tl: { top: "4px", left: "4px", borderWidth: "2px 0 0 2px" },
    tr: { top: "4px", right: "4px", borderWidth: "2px 2px 0 0" },
    bl: { bottom: "4px", left: "4px", borderWidth: "0 0 2px 2px" },
    br: { bottom: "4px", right: "4px", borderWidth: "0 2px 2px 0" },
  };

  return { ...base, ...positions[pos] };
}

const lines = [
  "HACK THE PLANET",
  "THINK LIKE AN ATTACKER",
  "DEFENSE STARTS WITH OFFENSE",
  "BREAK IT BEFORE THEY DO",
  "ROOT ACCESS GRANTED",
  "NO CAP, JUST PACKETS",
  "SECURITY IS A MINDSET",
];

export default function HeroBanner() {
  const bannerRef = useRef(null);
  const canvasRef = useRef(null);
  const [lineIndex, setLineIndex] = useState(0);

  // rotating line
  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % lines.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    const banner = bannerRef.current;
    if (!canvas || !banner) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = banner.offsetWidth;
      canvas.height = banner.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const glyphs =
      "01アイウエカキサタナ{}[]<>/\\#$@!?%^&*01010110";

    const drops = Array.from({ length: 55 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * -400,
      speed: 1 + Math.random() * 2,
      len: 5 + Math.floor(Math.random() * 9),
      chars: [],
      op: 0.05 + Math.random() * 0.1,
    }));

    drops.forEach((d) => {
      d.chars = Array.from(
        { length: d.len },
        () => glyphs[Math.floor(Math.random() * glyphs.length)]
      );
    });

    let frame = 0;
    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "28px monospace";

      drops.forEach((d) => {
        for (let i = 0; i < d.chars.length; i++) {
          const isHead = i === d.chars.length - 1;
          const alpha = isHead
            ? Math.min(d.op * 2.1, 0.7)
            : d.op * (i / d.chars.length);

          ctx.fillStyle = isHead
            ? `rgba(180,255,180,${alpha})`
            : `rgba(0,190,55,${alpha})`;

          ctx.fillText(d.chars[i], d.x, d.y - i * 13);
        }

        d.y += d.speed;

        if (frame % 5 === 0) {
          const idx = Math.floor(Math.random() * d.chars.length);
          d.chars[idx] =
            glyphs[Math.floor(Math.random() * glyphs.length)];
        }

        if (d.y - d.len * 13 > canvas.height) {
          d.y = -20;
          d.x = Math.random() * canvas.width;
        }
      });

      frame++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      ref={bannerRef}
      style={{
        width: "100%",
        height: "auto",
        background: "#020b06",
        border: "3px solid #A1FFC2",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Press Start 2P", monospace',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#0a1f0f 1px, transparent 1px), linear-gradient(90deg, #0a1f0f 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          zIndex: 0,
        }}
      />

      {/* scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.15) 3px, rgba(0,0,0,.15) 4px)",
          zIndex: 5,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      />
      <div style={cornerStyle("tl")} />
      <div style={cornerStyle("tr")} />
      <div style={cornerStyle("bl")} />
      <div style={cornerStyle("br")} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(12px, 2vw, 24px)",
          padding: "clamp(30px, 5vw, 60px) clamp(16px, 4vw, 48px)",
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(12px, 2vw, 24px)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <PixelSkull size={36} />

          <div>
            <h1
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "clamp(24px, 3.5vw, 40px)",
                color: "#b3eec2",
                letterSpacing: "4px",
                lineHeight: 1.5,
                animation: "glitch 7s infinite",
                margin: 0,
                fontWeight: 900,
              }}
            >
              Crucible
            </h1>

            <span
              style={{
                display: "block",
                fontSize: "clamp(9px, 1vw, 13px)",
                letterSpacing: "5px",
                color: "#00ff41",

                marginTop: "10px",
                fontWeight: 700,
              }}
            >
              {lines[lineIndex]}
            </span>
          </div>

          <PixelSkull size={36} />
        </div>

        <div
          style={{
            fontSize: "clamp(8px, 0.8vw, 11px)",
            color: "#ffdd00",
            letterSpacing: "4px",
            fontWeight: 700,
          }}
        >
          // LEARN • EXPLOIT • CAPTURE //
        </div>

        <div
          style={{
            border: "1px solid #A1FFC2",
            background: "rgba(0,255,65,.05)",
            padding: "clamp(20px, 3vw, 36px) clamp(24px, 5vw, 56px)",
          }}
        >
          <div
            style={{
              fontSize: "clamp(12px, 1.8vw, 22px)",
              color: "#00ff41",
              letterSpacing: "6px",
              fontWeight: 900,
            }}
          >
            ZERO TO HERO
          </div>

          <div
            style={{
              marginTop: "24px",
              fontSize: "clamp(9px, 1vw, 13px)",
              color: "#ffdd00",
              letterSpacing: "2px",
              fontWeight: 700,
            }}
          >
            Ethical Hacking Master Class
          </div>
        </div>
      </div>
    </section>
  );
}