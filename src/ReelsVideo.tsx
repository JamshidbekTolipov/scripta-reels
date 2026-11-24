import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

const VIDEO_FILE = 'video_1.mp4';
// public/sfx/ ga whoosh.mp3, hit.mp3, type.mp3 tashlaganingdan keyin true qil
const USE_SFX = false;

// Google Fonts yuklash (Anton, Bebas Neue, Playfair Display, JetBrains Mono)
const useEditorialFonts = () => {
  const [handle] = useState(() => delayRender('Loading editorial fonts'));

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=JetBrains+Mono:wght@600;800&family=Playfair+Display:ital,wght@0,800;1,700&display=swap';
    document.head.appendChild(link);

    const timer = setTimeout(finish, 3500);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        clearTimeout(timer);
        finish();
      });
    } else {
      finish();
    }

    return () => {
      clearTimeout(timer);
    };
  }, [handle]);
};

// Kino donadorligi (SVG Film Grain)
const FilmGrain: React.FC<{ frame: number }> = ({ frame }) => {
  const seed = Math.floor(frame / 2) % 30;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: 0.085, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%">
        <filter id="cinemaGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="3" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinemaGrain)" />
      </svg>
    </AbsoluteFill>
  );
};

// Old planda suzuvchi xira qizil zarralar (1Pas 00:34 uslubi)
const CrimsonBokehParticles: React.FC<{ frame: number; intensity?: number }> = ({
  frame,
  intensity = 1,
}) => {
  const particles = Array.from({ length: 18 }, (_, i) => {
    const speed = 1.4 + (i % 5) * 0.65;
    const x = ((i * 197 + frame * speed * (i % 2 === 0 ? 1.3 : -0.9)) % 2100 + 2100) % 2100 - 90;
    const y = ((i * 131 + frame * (speed * 1.1)) % 1260 + 1260) % 1260 - 90;
    const size = 14 + (i % 6) * 10;
    const rot = frame * (i % 2 === 0 ? 2.2 : -1.8) + i * 40;
    const blur = i % 3 === 0 ? 6 : i % 3 === 1 ? 2 : 0;
    return { x, y, size, rot, blur, isShard: i % 2 === 0 };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: intensity, overflow: 'hidden' }}>
      {particles.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.isShard ? p.size * 0.45 : p.size,
            backgroundColor: idx % 3 === 0 ? '#FF1E38' : '#991B1B',
            borderRadius: p.isShard ? '2px 10px 2px 10px' : '50%',
            transform: `rotate(${p.rot}deg)`,
            filter: `blur(${p.blur}px)`,
            boxShadow: '0 0 24px rgba(255, 30, 56, 0.7)',
            opacity: 0.78,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// 1-SAHNA (00:00 - 00:02.3): Editorial Intro Title
const IntroTitleOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titlePop = spring({ frame, fps, config: { damping: 16, stiffness: 130 } });
  const tagSlide = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 160 } });
  const fadeOut = interpolate(frame, [52, 68], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 95,
        opacity: fadeOut,
        pointerEvents: 'none',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/hit.mp3')} volume={0.65} />}
      <div
        style={{
          textAlign: 'center',
          transform: `scale(${interpolate(titlePop, [0, 1], [1.14, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 112,
            fontWeight: 800,
            color: '#F8F5EE',
            letterSpacing: 6,
            lineHeight: 0.95,
            textShadow: '0 10px 40px rgba(0,0,0,0.95), 0 0 40px rgba(255,30,56,0.35)',
          }}
        >
          HECH KIM AYTOLMAGAN
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 18,
            backgroundColor: '#F3EDE2',
            color: '#0D0D10',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48,
            letterSpacing: 12,
            padding: '8px 42px 4px 50px',
            transform: `translateY(${interpolate(tagSlide, [0, 1], [35, 0])}px)`,
            opacity: tagSlide,
            boxShadow: '0 14px 40px rgba(0,0,0,0.75)',
          }}
        >
          GAPLARNI AYTAMIZ
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 2-SAHNA (00:04.2 - 00:05.7): 1Pas uslubidagi Qizil Plashka ("TRANZAKSIYA")
const CrimsonEditorialBox: React.FC<{
  text: string;
  left?: string;
  top?: string;
}> = ({ text, left = '50%', top = '78%' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({ frame, fps, config: { damping: 13, stiffness: 220 } });
  const clipRight = interpolate(slam, [0, 1], [100, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transform: `translate(-50%, -50%) scale(${interpolate(slam, [0, 1], [0.9, 1])})`,
        backgroundColor: '#B5121B',
        padding: '10px 44px 4px 44px',
        clipPath: `inset(0 ${clipRight}% 0 0)`,
        boxShadow: '0 0 55px rgba(255, 25, 50, 0.55), 0 18px 40px rgba(0,0,0,0.75)',
        borderLeft: '6px solid #FF3B4E',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/hit.mp3')} volume={0.55} />}
      <span
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 82,
          letterSpacing: 6,
          color: '#FFFFFF',
          lineHeight: 1,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// 3-SAHNA (00:08.5 - 00:10.9): 3D Stol + Bosma Posterlar (1Pas 00:10 uslubi)
const DeskPosters3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camZoom = interpolate(frame, [0, 72], [1.0, 1.22], { extrapolateRight: 'clamp' });
  const camPanX = interpolate(frame, [0, 72], [40, -60], { extrapolateRight: 'clamp' });

  const card1Drop = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 14, stiffness: 150 } });
  const card2Drop = spring({ frame: Math.max(0, frame - 24), fps, config: { damping: 13, stiffness: 165 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#121215',
        overflow: 'hidden',
        perspective: 1200,
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.6} />}
      {/* 3D Cutting Mat Stol */}
      <AbsoluteFill
        style={{
          transform: `scale(${camZoom}) translateX(${camPanX}px) rotateX(34deg) rotateZ(-12deg)`,
          transformStyle: 'preserve-3d',
          backgroundImage: `
            radial-gradient(circle at 50% 45%, rgba(220, 38, 38, 0.16) 0%, rgba(12, 12, 14, 0.96) 72%),
            linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* 1-Poster: OTNOSHENIYA = TRANZAKSIYA */}
        <div
          style={{
            position: 'absolute',
            left: '26%',
            top: '20%',
            width: 470,
            backgroundColor: '#EDE5D6',
            padding: 26,
            boxShadow: '26px 42px 70px rgba(0,0,0,0.9)',
            transform: `translateZ(${interpolate(card1Drop, [0, 1], [350, 0])}px) rotate(-5deg)`,
            opacity: card1Drop,
          }}
        >
          <div
            style={{
              height: 360,
              background: 'linear-gradient(145deg, #991B1B 0%, #1F070A 65%, #09090B 100%)',
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                color: '#FCA5A5',
                letterSpacing: 3,
              }}
            >
              ISSUE 01 // REALITY
            </div>
            {/* Dekorativ grafik chiziq */}
            <svg width="100%" height="140" viewBox="0 0 360 140">
              <polyline
                fill="none"
                stroke="#FF2A42"
                strokeWidth="5"
                points="10,120 80,95 140,105 220,45 280,60 350,15"
              />
              <circle cx="350" cy="15" r="8" fill="#FFFFFF" />
            </svg>
            <div
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 56,
                color: '#FFFFFF',
                lineHeight: 0.95,
              }}
            >
              LOVE? OTNOSHENIYA?
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: '#111114', letterSpacing: 2 }}>
              BU — TRANZAKSIYA
            </div>
            <div
              style={{
                backgroundColor: '#B5121B',
                color: '#FFF',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                fontWeight: 800,
                padding: '6px 12px',
              }}
            >
              100%
            </div>
          </div>
        </div>

        {/* 2-Poster: PROSTA TAK YAXSHI KO'RMAYDI */}
        <div
          style={{
            position: 'absolute',
            left: '51%',
            top: '27%',
            width: 490,
            backgroundColor: '#F2EBE0',
            padding: 26,
            boxShadow: '32px 50px 85px rgba(0,0,0,0.95)',
            transform: `translateZ(${interpolate(card2Drop, [0, 1], [420, 20])}px) rotate(6deg)`,
            opacity: card2Drop,
          }}
        >
          <div
            style={{
              height: 360,
              background: 'linear-gradient(160deg, #DC2626 0%, #450A0A 55%, #09090B 100%)',
              padding: 30,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                alignSelf: 'flex-start',
                border: '2px solid rgba(255,255,255,0.6)',
                padding: '4px 14px',
                color: '#FFF',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
              }}
            >
              TRUTH #02
            </div>
            <div
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 66,
                color: '#FFFFFF',
                lineHeight: 0.96,
                textShadow: '0 6px 24px rgba(0,0,0,0.8)',
              }}
            >
              PROSTA TAK
              <br />
              <span style={{ color: '#FCA5A5' }}>YAXSHI KO‘RMAYDI</span>
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 18,
              color: '#3F3F46',
              letterSpacing: 2,
              fontWeight: 800,
            }}
          >
            HECH KIM — NANAYIZ HAM, DADAYIZ HAM
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 4-SAHNA (00:11.0 - 00:13.2): Barmoq sanash ritmi (1, 2, 3 -> RAHM QILMAYDI)
const FingerCountOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const step = frame < 15 ? 1 : frame < 30 ? 2 : frame < 44 ? 3 : 4;
  const localFrame = step === 1 ? frame : step === 2 ? frame - 15 : step === 3 ? frame - 30 : frame - 44;
  const pop = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 250 } });

  if (step <= 3) {
    return (
      <div
        style={{
          position: 'absolute',
          right: '14%',
          top: '36%',
          transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`,
          textAlign: 'right',
        }}
      >
        <div
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 220,
            lineHeight: 0.85,
            color: '#FF1E38',
            textShadow: '0 0 60px rgba(255, 30, 56, 0.85), 0 12px 30px rgba(0,0,0,0.9)',
          }}
        >
          0{step}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 52,
            letterSpacing: 6,
            color: '#FFFFFF',
            textShadow: '0 4px 20px rgba(0,0,0,0.95)',
          }}
        >
          {step === 1 ? 'BIR AYTDIM' : step === 2 ? 'IKKI AYTDIM' : 'UCH AYTDIM'}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '12%',
        transform: `translateX(-50%) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 96,
          letterSpacing: 6,
          color: '#FFFFFF',
          textShadow: '0 0 40px rgba(255, 30, 56, 0.9), 0 8px 30px #000',
        }}
      >
        HECH KIM <span style={{ color: '#FF1E38' }}>RAHM QILMAYDI</span>
      </div>
    </div>
  );
};

// 5-SAHNA (00:13.3 - 00:16.7): Chap Split-Screen $10M Editorial Poster + Kursor (1Pas 00:12 uslubi)
const SplitPoster10MLeft: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const posterPop = spring({ frame, fps, config: { damping: 15, stiffness: 130 } });
  const amount = Math.floor(
    interpolate(frame, [4, 48], [0, 10000000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  ).toLocaleString('en-US');

  // Harakatlanuvchi kursor
  const cursorX = interpolate(frame, [10, 48, 70], [720, 540, 565], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(frame, [10, 48, 70], [820, 540, 515], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '50%',
        height: '100%',
        background:
          'radial-gradient(circle at 40% 35%, #5C0B14 0%, #1B0407 55%, #090204 100%)',
        borderRight: '5px solid #DC2626',
        boxShadow: '12px 0 60px rgba(220, 38, 38, 0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Mato tekstura setkasi */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 8px)',
        }}
      />

      {/* Ramkali Poster */}
      <div
        style={{
          width: 660,
          backgroundColor: '#EFE7D8',
          padding: 34,
          boxShadow: '0 36px 90px rgba(0,0,0,0.9)',
          transform: `scale(${interpolate(posterPop, [0, 1], [0.85, 1])}) rotate(-1.5deg)`,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(155deg, #D91E2A 0%, #590911 52%, #0C0A0C 100%)',
            padding: '44px 36px',
            minHeight: 620,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 20,
                color: '#FECACA',
                letterSpacing: 3,
              }}
            >
              BIG DEAL // LOGISTICS
            </span>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: '#FF2A42',
                boxShadow: '0 0 18px #FF2A42',
              }}
            />
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 38,
                color: '#FCA5A5',
                letterSpacing: 8,
              }}
            >
              ORQASIDAN ISHLAB BERAMAN
            </div>
            <div
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 108,
                color: '#FFFFFF',
                lineHeight: 1.05,
                textShadow: '0 0 45px rgba(255, 30, 56, 0.85)',
              }}
            >
              ${amount}
            </div>
          </div>

          <div
            style={{
              borderTop: '2px solid rgba(255,255,255,0.25)',
              paddingTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 44,
                color: '#FFFFFF',
                letterSpacing: 3,
              }}
            >
              QANCHASINI BERASAN?
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                backgroundColor: '#FFFFFF',
                color: '#0D0D10',
                padding: '6px 16px',
                fontWeight: 800,
              }}
            >
              % ?
            </div>
          </div>
        </div>
      </div>

      {/* Animatsion Kursor */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: cursorX,
          top: cursorY,
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.85))',
        }}
      >
        <path
          d="M4 2 L4 20 L9.5 15 L14 22 L17 20.5 L12.5 13.5 L19 13 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

// 6-SAHNA (00:17.8 - 00:19.8): Ikki rangli Neon Glow matn (1Pas 00:24 SEMESTERGA uslubi)
const NeonSplitWord: React.FC<{
  whitePart: string;
  neonPart: string;
  sub?: string;
  left: string;
  top: string;
}> = ({ whitePart, neonPart, sub, left, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 170 } });

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transform: `translate(-50%, -50%) translateY(${interpolate(pop, [0, 1], [24, 0])}px)`,
        opacity: pop,
        textAlign: 'left',
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 108,
          letterSpacing: 5,
          lineHeight: 0.92,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#FFFFFF', textShadow: '0 6px 26px rgba(0,0,0,0.95)' }}>
          {whitePart}
        </span>
        <span
          style={{
            color: '#FF1E38',
            textShadow:
              '0 0 22px rgba(255, 30, 56, 0.95), 0 0 60px rgba(255, 30, 56, 0.7), 0 6px 20px #000',
          }}
        >
          {neonPart}
        </span>
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 24,
            color: '#E5E7EB',
            letterSpacing: 6,
            marginTop: 6,
            textShadow: '0 4px 16px #000',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

// 7-SAHNA (00:20.0 - 00:23.2): 3D Aylanuvchi Neon-Metall Emblema (1Pas 00:18 uslubi)
const RotatingNeonEmblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const rotY = interpolate(frame, [0, 96], [-28, 38]);
  const rotX = interpolate(frame, [0, 96], [10, -8]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(5, 5, 8, 0.62)',
        perspective: 1100,
      }}
    >
      <div
        style={{
          transform: `scale(${enter}) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformStyle: 'preserve-3d',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <svg
          width="460"
          height="460"
          viewBox="0 0 300 300"
          style={{
            filter:
              'drop-shadow(0 0 35px rgba(255, 30, 56, 0.75)) drop-shadow(0 25px 40px rgba(0,0,0,0.95))',
          }}
        >
          <defs>
            <linearGradient id="metalNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#A1A1AA" />
              <stop offset="75%" stopColor="#FF1E38" />
              <stop offset="100%" stopColor="#450A0A" />
            </linearGradient>
          </defs>
          <circle cx="150" cy="150" r="134" fill="none" stroke="url(#metalNeon)" strokeWidth="10" />
          <circle
            cx="150"
            cy="150"
            r="112"
            fill="rgba(10,10,14,0.72)"
            stroke="#FF1E38"
            strokeWidth="2.5"
            strokeDasharray="10 8"
          />
          <polygon
            points="150,54 228,198 72,198"
            fill="none"
            stroke="url(#metalNeon)"
            strokeWidth="8"
          />
          <text
            x="150"
            y="168"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="Anton, sans-serif"
            fontSize="44"
            letterSpacing="4"
          >
            REAL
          </text>
        </svg>

        <div
          style={{
            marginTop: 26,
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 44,
            color: '#F3EDE2',
            letterSpacing: 3,
            textShadow: '0 6px 24px #000',
          }}
        >
          “Xudo shuni xohish qildi...”
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 8-SAHNA (00:25.1 - 00:27.0): $6M Neon Telemetriya (Spiker o'ng tarafida)
const Telemetry6M: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 13, stiffness: 200 } });
  const val = Math.floor(
    interpolate(frame, [0, 26], [0, 6000000], { extrapolateRight: 'clamp' })
  ).toLocaleString('en-US');

  return (
    <div
      style={{
        position: 'absolute',
        right: '7%',
        top: '28%',
        transform: `translateX(${interpolate(pop, [0, 1], [80, 0])}px)`,
        opacity: pop,
        borderLeft: '8px solid #FF1E38',
        paddingLeft: 32,
        background: 'linear-gradient(90deg, rgba(10,10,14,0.82) 0%, rgba(10,10,14,0) 100%)',
        paddingTop: 18,
        paddingBottom: 18,
        paddingRight: 40,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 24,
          color: '#FF4D63',
          letterSpacing: 5,
          fontWeight: 800,
        }}
      >
        1 OYDA NATIJA
      </div>
      <div
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 112,
          color: '#FFFFFF',
          lineHeight: 1.0,
          textShadow: '0 0 40px rgba(255, 30, 56, 0.8), 0 8px 25px #000',
        }}
      >
        ${val}
      </div>
    </div>
  );
};

// 9-SAHNA (00:29.2 - 00:32.9): Chap Split-Screen Jonli Yozuv Mashinkasi + Klaviatura (1Pas 00:20 uslubi)
const TYPE_TEXT =
  "BIR OYDA 1000$ TOPISHNI O'RGATAMIZ DEYDI... U LOGISTIKA EMAS!";

const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const SplitTypewriterLeft: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slide = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const totalChars = TYPE_TEXT.length;
  const typedCount = Math.min(
    totalChars,
    Math.floor(interpolate(frame, [4, 92], [0, totalChars], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  );
  const currentText = TYPE_TEXT.slice(0, typedCount);
  const activeChar = TYPE_TEXT[Math.max(0, typedCount - 1)]?.toUpperCase() || '';
  const showCursor = frame % 12 < 6;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '50%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 45%, #7F1D1D 0%, #31070C 60%, #120205 100%)',
        borderRight: '5px solid #DC2626',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Qizil mato tekstura */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 2px, transparent 2px 6px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 6px)',
        }}
      />

      {/* Yozuv mashinkasi qurilmasi */}
      <div
        style={{
          width: 720,
          backgroundColor: '#1B1A1E',
          borderRadius: 28,
          padding: 24,
          boxShadow: '0 40px 90px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.15)',
          transform: `scale(${interpolate(slide, [0, 1], [0.9, 1])})`,
        }}
      >
        {/* Qog'oz qismi */}
        <div
          style={{
            background: 'linear-gradient(180deg, #E7DFCE 0%, #D5CBB5 100%)',
            borderRadius: '18px 18px 6px 6px',
            padding: '44px 42px',
            minHeight: 370,
            position: 'relative',
            boxShadow: 'inset 0 0 40px rgba(70, 50, 30, 0.25)',
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 36,
              fontWeight: 800,
              color: '#18181B',
              lineHeight: 1.45,
              letterSpacing: 1,
            }}
          >
            {currentText}
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 38,
                backgroundColor: '#DC2626',
                marginLeft: 6,
                verticalAlign: 'middle',
                opacity: showCursor ? 1 : 0,
              }}
            />
          </div>

          {/* Metall chizg'ich */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 34,
              height: 10,
              background: 'linear-gradient(180deg, #52525B 0%, #18181B 100%)',
            }}
          />
        </div>

        {/* Klaviatura qismi */}
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {KB_ROWS.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {row.map((key) => {
                const isPressed = key === activeChar && typedCount < totalChars;
                return (
                  <div
                    key={key}
                    style={{
                      width: 56,
                      height: 58,
                      borderRadius: 10,
                      backgroundColor: isPressed ? '#FF1E38' : '#27272A',
                      color: isPressed ? '#FFFFFF' : '#A1A1AA',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 22,
                      fontWeight: 800,
                      transform: isPressed ? 'translateY(4px) scale(0.96)' : 'none',
                      boxShadow: isPressed
                        ? '0 0 28px rgba(255, 30, 56, 0.95)'
                        : '0 5px 0 #09090B, inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    {key}
                  </div>
                );
              })}
            </div>
          ))}
          {/* Spacebar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <div
              style={{
                width: 340,
                height: 46,
                borderRadius: 10,
                backgroundColor: activeChar === ' ' ? '#FF1E38' : '#27272A',
                boxShadow:
                  activeChar === ' '
                    ? '0 0 24px rgba(255, 30, 56, 0.9)'
                    : '0 5px 0 #09090B',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 10-SAHNA (00:33.0 - 00:35.6): 3D Uchuvchi Buklangan Qog'oz ("MENING IMPERIYAM" — 1Pas 00:30 uslubi)
const FlyingOrigamiBanner: React.FC = () => {
  const frame = useCurrentFrame();

  const x = interpolate(frame, [0, 78], [-650, 720]);
  const y = interpolate(frame, [0, 38, 78], [160, -40, -180]);
  const rotY = interpolate(frame, [0, 78], [-35, 25]);
  const rotZ = interpolate(frame, [0, 78], [-18, -6]);
  const scale = interpolate(frame, [0, 35, 78], [0.75, 1.15, 0.95]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1200,
        pointerEvents: 'none',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.65} />}
      <div
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale}) rotateY(${rotY}deg) rotateX(18deg) rotateZ(${rotZ}deg)`,
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: 920,
          height: 360,
        }}
      >
        {/* Yuqori qizil qanot */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #B91C1C 0%, #450A0A 100%)',
            clipPath: 'polygon(0% 100%, 55% 0%, 100% 62%)',
            boxShadow: '0 30px 70px rgba(0,0,0,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 70,
          }}
        >
          <div
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 74,
              color: '#F8F5EE',
              letterSpacing: 4,
              transform: 'rotate(-14deg)',
              textShadow: '0 6px 24px rgba(0,0,0,0.85)',
            }}
          >
            MENING IMPERIYAM
          </div>
        </div>
        {/* Pastki qora soya qanoti */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #18181B 0%, #09090B 100%)',
            clipPath: 'polygon(0% 100%, 100% 62%, 78% 96%)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// 12-SAHNA (00:46.8 - 00:49.5): 1Pas uslubidagi Yakuniy Outro ("Coming soon..." o'rniga)
const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050507',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/hit.mp3')} volume={0.7} />}
      <div style={{ transform: `scale(${pop})` }}>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 48,
            fontWeight: 800,
            color: '#F4F4F5',
            marginBottom: 42,
            letterSpacing: 1,
          }}
        >
          Xulosa qilishga shoshilmang!
        </div>

        {/* Neon ramkali Thumbnail karta */}
        <div
          style={{
            width: 820,
            height: 440,
            borderRadius: 34,
            background: 'radial-gradient(circle at 75% 40%, #7F1D1D 0%, #140407 60%, #09090B 100%)',
            border: '4px solid rgba(255, 30, 56, 0.75)',
            boxShadow: '0 0 90px rgba(255, 30, 56, 0.4), 0 30px 80px rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 60px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 24,
              color: '#FF4D63',
              letterSpacing: 8,
              marginBottom: 16,
            }}
          >
            TEZ KUNDA // FULL PODCAST
          </div>
          <div
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 88,
              color: '#FFFFFF',
              lineHeight: 1.02,
              letterSpacing: 2,
            }}
          >
            LOGISTIKADAGI
            <br />
            <span style={{ color: '#FF1E38' }}>YASHIRIN HAQIQAT</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 46,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 38,
            fontWeight: 700,
            color: '#E4E4E7',
          }}
        >
          <span>To‘liq suhbat tez kunda</span>
          <span
            style={{
              backgroundColor: '#FF0000',
              color: '#FFFFFF',
              padding: '6px 22px',
              borderRadius: 12,
              fontWeight: 900,
              fontSize: 32,
            }}
          >
            ▶ YouTube
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsVideo: React.FC = () => {
  useEditorialFonts();

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  // Split-screen sahnalarini aniqlash
  const isSplit10M = sec >= 13.3 && sec < 16.7;
  const isSplitType = sec >= 29.2 && sec < 32.9;
  const isSplit = isSplit10M || isSplitType;

  // Kadr holatlari
  const isBW =
    (sec >= 4.2 && sec < 5.7) ||
    (sec >= 12.5 && sec < 13.3) ||
    (sec >= 44.5 && sec < 46.8);

  const isBlurredBg =
    (sec >= 20.0 && sec < 23.2) || (sec >= 33.0 && sec < 35.6);

  const showParticles = sec >= 33.0 && sec < 46.8;

  // Sekin kamera harakati (Zoom)
  const slowZoom = isBW
    ? 1.08
    : isSplit
      ? 1.05
      : interpolate(frame % 180, [0, 180], [1.0, 1.06]);

  // Spiker yuzini split-screen ichida aniq markazda ushlash
  const focalPosition = isSplit10M
    ? '48% 28%'
    : isSplitType
      ? '52% 28%'
      : '50% 50%';

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      {/* Asosiy audio (uzluksiz, 100% sinxron) */}
      <Audio src={staticFile(VIDEO_FILE)} volume={1} />

      {/* Asosiy Video qatlami (Split-screen paytida o'ng 50% ga silliq joylashadi) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: isSplit ? '50%' : '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <OffthreadVideo
          muted
          src={staticFile(VIDEO_FILE)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: focalPosition,
            transform: `scale(${slowZoom})`,
            filter: isBW
              ? 'grayscale(100%) contrast(138%) brightness(82%)'
              : isBlurredBg
                ? 'blur(7px) contrast(115%) brightness(65%) saturate(85%)'
                : 'contrast(112%) saturate(96%) brightness(95%)',
          }}
        />
      </div>

      {/* Kinematografik Vinyetka */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 48%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.78) 100%)',
        }}
      />

      {/* 00:00.0 - 00:02.3: Intro Title */}
      <Sequence from={s(0)} durationInFrames={s(2.3)}>
        <IntroTitleOverlay />
      </Sequence>

      {/* 00:04.2 - 00:05.7: TRANZAKSIYA (B&W + Crimson Box) */}
      <Sequence from={s(4.2)} durationInFrames={s(1.5)}>
        <CrimsonEditorialBox text="TRANZAKSIYA" left="50%" top="80%" />
      </Sequence>

      {/* 00:08.5 - 00:10.9: 3D Stol + Bosma Posterlar */}
      <Sequence from={s(8.5)} durationInFrames={s(2.4)}>
        <DeskPosters3DScene />
      </Sequence>

      {/* 00:11.0 - 00:13.2: 01 / 02 / 03 -> HECH KIM RAHM QILMAYDI */}
      <Sequence from={s(11.0)} durationInFrames={s(2.2)}>
        <FingerCountOverlay />
      </Sequence>

      {/* 00:13.3 - 00:16.7: Chap Split-Screen $10M Poster + Kursor */}
      <Sequence from={s(13.3)} durationInFrames={s(3.4)}>
        <SplitPoster10MLeft />
      </Sequence>

      {/* 00:17.8 - 00:19.8: Ikki rangli Neon Glow */}
      <Sequence from={s(17.8)} durationInFrames={s(2.0)}>
        <NeonSplitWord
          whitePart="OCHIQ-"
          neonPart="OYDIN"
          sub="ORQADAN KELMA"
          left="74%"
          top="46%"
        />
      </Sequence>

      {/* 00:20.0 - 00:23.2: 3D Aylanuvchi Neon Emblema */}
      <Sequence from={s(20.0)} durationInFrames={s(3.2)}>
        <RotatingNeonEmblem />
      </Sequence>

      {/* 00:25.1 - 00:27.0: $6M Neon Telemetriya */}
      <Sequence from={s(25.1)} durationInFrames={s(1.9)}>
        <Telemetry6M />
      </Sequence>

      {/* 00:29.2 - 00:32.9: Chap Split-Screen Jonli Klaviatura */}
      <Sequence from={s(29.2)} durationInFrames={s(3.7)}>
        <SplitTypewriterLeft />
      </Sequence>

      {/* 00:33.0 - 00:35.6: 3D Uchuvchi Qog'oz Banner */}
      <Sequence from={s(33.0)} durationInFrames={s(2.6)}>
        <FlyingOrigamiBanner />
      </Sequence>

      {/* 00:36.0 - 00:38.4: MING LA'NAT */}
      <Sequence from={s(36.0)} durationInFrames={s(2.4)}>
        <CrimsonEditorialBox text="MING LA'NAT" left="24%" top="36%" />
      </Sequence>

      {/* 00:40.3 - 00:42.2: TREYDERLAR */}
      <Sequence from={s(40.3)} durationInFrames={s(1.9)}>
        <NeonSplitWord
          whitePart="TREY"
          neonPart="DERLAR"
          sub="KONSERT BERIB YURIBDI"
          left="28%"
          top="72%"
        />
      </Sequence>

      {/* 00:44.5 - 00:46.8: KOMPANIYASI YO'Q */}
      <Sequence from={s(44.5)} durationInFrames={s(2.3)}>
        <NeonSplitWord
          whitePart="KOMPANIYASI "
          neonPart="YO‘Q"
          left="50%"
          top="78%"
        />
      </Sequence>

      {/* Old plandagi xira qizil zarralar */}
      {showParticles && <CrimsonBokehParticles frame={frame} intensity={0.85} />}

      {/* 00:46.8 - 00:49.5: Custom Neon Outro */}
      <Sequence from={s(46.8)} durationInFrames={s(2.7)}>
        <OutroCard />
      </Sequence>

      {/* Global Kino Donadorligi (Film Grain) */}
      <FilmGrain frame={frame} />
    </AbsoluteFill>
  );
};