import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
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
const sec = (s: number) => Math.round(s * FPS);

const AUDIO_SOURCE = 'video_1.mp4';
// public/sfx/ papkasiga whoosh.mp3 va pop.mp3 tashlasang true qil
const USE_SFX = false;

const useBrandFonts = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    let finished = false;
    const done = () => {
      if (!finished) {
        finished = true;
        continueRender(handle);
      }
    };
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600;800&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap';
    document.head.appendChild(link);
    const t = setTimeout(done, 3000);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        clearTimeout(t);
        done();
      });
    } else {
      done();
    }
    return () => clearTimeout(t);
  }, [handle]);
};

type VocabItem = {
  id: string;
  num: string;
  uz: string;
  en: string;
  ipa: string;
  startSec: number;
  endSec: number;
  enDelaySec: number;
  accent: string;
  icon: 'heart' | 'crown' | 'dice' | 'eye' | 'whisper' | 'sin';
};

const VOCAB_LIST: VocabItem[] = [
  {
    id: 'adultery',
    num: '01',
    uz: 'Zino',
    en: 'ADULTERY',
    ipa: '/əˈdʌl.tər.i/',
    startSec: 3.6,
    endSec: 6.2,
    enDelaySec: 0.75,
    accent: '#F43F5E',
    icon: 'heart',
  },
  {
    id: 'arrogance',
    num: '02',
    uz: 'Kibr',
    en: 'ARROGANCE',
    ipa: '/ˈær.ə.ɡəns/',
    startSec: 6.2,
    endSec: 8.5,
    enDelaySec: 0.65,
    accent: '#F59E0B',
    icon: 'crown',
  },
  {
    id: 'gamble',
    num: '03',
    uz: 'Qimor',
    en: 'GAMBLE',
    ipa: '/ˈɡæm.bəl/',
    startSec: 8.5,
    endSec: 10.8,
    enDelaySec: 0.65,
    accent: '#EF4444',
    icon: 'dice',
  },
  {
    id: 'envy',
    num: '04',
    uz: 'Hasad',
    en: 'ENVY',
    ipa: '/ˈen.vi/',
    startSec: 10.8,
    endSec: 13.0,
    enDelaySec: 0.6,
    accent: '#10B981',
    icon: 'eye',
  },
  {
    id: 'backbiting',
    num: '05',
    uz: 'G‘iybat',
    en: 'BACKBITING',
    ipa: '/ˈbækˌbaɪ.tɪŋ/',
    startSec: 13.0,
    endSec: 15.3,
    enDelaySec: 0.65,
    accent: '#8B5CF6',
    icon: 'whisper',
  },
  {
    id: 'sin',
    num: 'BONUS',
    uz: 'Gunoh (umumiy)',
    en: 'SIN',
    ipa: '/sɪn/',
    startSec: 15.3,
    endSec: 18.3,
    enDelaySec: 1.15,
    accent: '#38BDF8',
    icon: 'sin',
  },
];

// Mavzuga mos maxsus SVG ikonkalar
const TopicIcon: React.FC<{ type: VocabItem['icon']; color: string }> = ({ type, color }) => {
  const common = {
    width: 110,
    height: 110,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'heart': // Siniq yurak (Zino)
      return (
        <svg {...common}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="m12 5-1.5 4 3 3-2 5" />
        </svg>
      );
    case 'crown': // Toj (Kibr)
      return (
        <svg {...common}>
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
      );
    case 'dice': // O'yin kubigi (Qimor)
      return (
        <svg {...common}>
          <rect width="18" height="18" x="3" y="3" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.2" fill={color} />
          <circle cx="15.5" cy="8.5" r="1.2" fill={color} />
          <circle cx="12" cy="12" r="1.2" fill={color} />
          <circle cx="8.5" cy="15.5" r="1.2" fill={color} />
          <circle cx="15.5" cy="15.5" r="1.2" fill={color} />
        </svg>
      );
    case 'eye': // Ko'z (Hasad)
      return (
        <svg {...common}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'whisper': // G'iybat (ikki gaplashuvchi profil)
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </svg>
      );
    case 'sin': // Gunoh (Ogohlantirish qalqoni)
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
  }
};

// Jonli fon: harakatlanuvchi setka + suzuvchi kul/nur zarralari
const AtmosphericBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const gridOffset = (frame * 1.2) % 80;
  const embers = Array.from({ length: 16 }, (_, i) => {
    const x = ((i * 137 + Math.sin(frame * 0.03 + i) * 45) % 1080 + 1080) % 1080;
    const y = 1920 - (((frame * (1.8 + (i % 4) * 0.6) + i * 140) % 2000));
    const size = 4 + (i % 4) * 3;
    return { x, y, size, isBlue: i % 3 === 0 };
  });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 18%, #0F1E3A 0%, #060B19 52%, #02040A 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Tepadan tushuvchi Spotlight nuri */}
      <div
        style={{
          position: 'absolute',
          top: -220,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 900,
          background:
            'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0) 70%)',
        }}
      />

      {/* Harakatlanuvchi nozik setka */}
      <div
        style={{
          position: 'absolute',
          inset: -80,
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `translateY(${gridOffset}px)`,
        }}
      />

      {/* Yuqoriga ko'tariluvchi zarralar */}
      {embers.map((e, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: e.x,
            top: e.y,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            backgroundColor: e.isBlue ? '#38BDF8' : '#F43F5E',
            opacity: 0.45,
            boxShadow: e.isBlue ? '0 0 14px #38BDF8' : '0 0 14px #F43F5E',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Pastki Audio Visualizer (Scripta.uz Listening estetikasi)
const VoiceWaveBar: React.FC<{ frame: number }> = ({ frame }) => {
  const bars = Array.from({ length: 24 }, (_, i) => {
    const wave =
      Math.abs(Math.sin(frame * 0.24 + i * 0.65)) * 0.65 +
      Math.abs(Math.cos(frame * 0.17 - i * 0.4)) * 0.35;
    const height = 10 + wave * 36;
    return height;
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 135,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 50,
        opacity: 0.75,
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: h,
            borderRadius: 4,
            backgroundColor: i % 2 === 0 ? '#38BDF8' : '#60A5FA',
          }}
        />
      ))}
    </div>
  );
};

// 1-SAHNA: Intro (00:00 - 00:03.6)
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgePop = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const titlePop = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 13, stiffness: 120 } });
  const subPop = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 15, stiffness: 130 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 72px',
        textAlign: 'center',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.5} />}

      <div
        style={{
          transform: `scale(${badgePop})`,
          backgroundColor: 'rgba(244, 63, 94, 0.14)',
          border: '2px solid rgba(244, 63, 94, 0.5)',
          color: '#FDA4AF',
          padding: '14px 36px',
          borderRadius: 999,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 4,
          marginBottom: 46,
        }}
      >
        VOCABULARY // LUG‘AT
      </div>

      <h1
        style={{
          transform: `scale(${interpolate(titlePop, [0, 1], [0.86, 1])})`,
          opacity: titlePop,
          color: '#F8FAFC',
          fontSize: 88,
          fontWeight: 900,
          lineHeight: 1.12,
          margin: 0,
          letterSpacing: -1,
        }}
      >
        <span style={{ color: '#F43F5E', textShadow: '0 0 45px rgba(244, 63, 94, 0.45)' }}>
          Gunoh amallar
        </span>
        <br />
        ingliz tilida qanday aytiladi?
      </h1>

      <div
        style={{
          marginTop: 52,
          opacity: subPop,
          transform: `translateY(${interpolate(subPop, [0, 1], [24, 0])}px)`,
          color: '#94A3B8',
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        Keling, ko‘rib chiqamiz ↓
      </div>
    </AbsoluteFill>
  );
};

// 2-SAHNA: So'z kartochkasi (Ikonka + O'zbekcha -> Inglizcha + IPA)
const VocabCardScene: React.FC<{ item: VocabItem }> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = sec(item.enDelaySec);
  const uzPop = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const enPop = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // Kartochka ichida yorug'lik (shimmer) o'tishi
  const shimmerX = interpolate(frame, [delayFrames, delayFrames + 26], [-400, 900], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 64px',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.4} />}
      {USE_SFX && (
        <Sequence from={delayFrames}>
          <Audio src={staticFile('sfx/pop.mp3')} volume={0.65} />
        </Sequence>
      )}

      {/* Yuqori raqam */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 30,
          fontWeight: 800,
          color: item.accent,
          letterSpacing: 6,
          marginBottom: 28,
        }}
      >
        {item.num === 'BONUS' ? '★ ASOSIY SO‘Z' : `${item.num} / 05`}
      </div>

      {/* Asosiy Glassmorphism Karta */}
      <div
        style={{
          width: '100%',
          background:
            'linear-gradient(165deg, rgba(15, 23, 42, 0.92) 0%, rgba(7, 11, 24, 0.96) 100%)',
          border: `3px solid ${item.accent}66`,
          borderRadius: 44,
          padding: '64px 48px',
          textAlign: 'center',
          boxShadow: `0 30px 90px rgba(0, 0, 0, 0.8), 0 0 60px ${item.accent}26`,
          transform: `translateY(${interpolate(uzPop, [0, 1], [50, 0])}px)`,
          opacity: uzPop,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer nuri */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 240,
            left: shimmerX,
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            transform: 'skewX(-20deg)',
            pointerEvents: 'none',
          }}
        />

        {/* Mavzuga mos Ikonka */}
        <div
          style={{
            width: 176,
            height: 176,
            borderRadius: '50%',
            backgroundColor: `${item.accent}18`,
            border: `2px solid ${item.accent}55`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 36px auto',
            boxShadow: `0 0 40px ${item.accent}33`,
          }}
        >
          <TopicIcon type={item.icon} color={item.accent} />
        </div>

        {/* O'zbekcha so'z */}
        <div
          style={{
            color: '#94A3B8',
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          {item.uz}
        </div>

        {/* Ajratuvchi chiziq */}
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 4,
            backgroundColor: 'rgba(148, 163, 184, 0.25)',
            margin: '0 auto 32px auto',
          }}
        />

        {/* Inglizcha tarjimasi (spiker aytgan paytda zarba bilan chiqadi) */}
        <div
          style={{
            transform: `scale(${interpolate(enPop, [0, 1], [0.65, 1])})`,
            opacity: enPop,
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: item.en.length > 9 ? 82 : 96,
              fontWeight: 900,
              letterSpacing: 3,
              lineHeight: 1.05,
              textShadow: `0 0 40px ${item.accent}88`,
            }}
          >
            {item.en}
          </div>

          {/* Fonetik transkripsiya */}
          <div
            style={{
              marginTop: 22,
              display: 'inline-block',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 34,
              fontWeight: 600,
              color: item.accent,
              backgroundColor: `${item.accent}18`,
              padding: '10px 28px',
              borderRadius: 16,
            }}
          >
            {item.ipa}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3-SAHNA: Interaktiv Outro — "Savob ingliz tilida qanday aytiladi?" (00:18.3 - 00:23.0)
const OutroQuizScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardPop = spring({ frame, fps, config: { damping: 14, stiffness: 130 } });
  const ctaPop = spring({ frame: Math.max(0, frame - 36), fps, config: { damping: 12, stiffness: 160 } });
  const pulse = 1 + Math.sin(frame * 0.22) * 0.03;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 64px',
        textAlign: 'center',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/pop.mp3')} volume={0.65} />}

      <div
        style={{
          width: '100%',
          transform: `scale(${cardPop})`,
          background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.95) 0%, rgba(7, 11, 24, 0.98) 100%)',
          border: '3px solid #38BDF8',
          borderRadius: 44,
          padding: '64px 48px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.85), 0 0 70px rgba(56, 189, 248, 0.25)',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 28,
            fontWeight: 800,
            color: '#38BDF8',
            letterSpacing: 4,
            marginBottom: 24,
          }}
        >
          SIZNING NAVBATINGIZ
        </div>

        <h2
          style={{
            color: '#F8FAFC',
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.2,
            margin: '0 0 40px 0',
          }}
        >
          <span style={{ color: '#38BDF8' }}>“Savob”</span> ingliz tilida qanday aytiladi?
        </h2>

        {/* Scripta.uz diktant uslubidagi bo'sh katak */}
        <div
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            border: '2px dashed #38BDF8',
            borderRadius: 24,
            padding: '28px 36px',
            marginBottom: 44,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 48,
            fontWeight: 800,
            color: '#38BDF8',
            letterSpacing: 8,
          }}
        >
          _ _ _ _ _ _ ?
        </div>

        {/* Izohlarda yozing tugmasi */}
        <div
          style={{
            transform: `scale(${ctaPop * pulse})`,
            opacity: ctaPop,
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: 40,
            fontWeight: 800,
            padding: '26px 48px',
            borderRadius: 24,
            boxShadow: '0 14px 40px rgba(37, 99, 235, 0.5)',
          }}
        >
          Izohlarda yozib qoldiring 👇
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsVideo: React.FC = () => {
  useBrandFonts();

  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Asl audio */}
      <Audio src={staticFile(AUDIO_SOURCE)} volume={1} />

      {/* Dinamik Dark-Blue atmosfera */}
      <AtmosphericBackdrop frame={frame} />

      {/* Yuqori Progress Bar */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 56,
          right: 56,
          height: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#38BDF8',
            boxShadow: '0 0 18px #38BDF8',
          }}
        />
      </div>

      {/* Yuqori Scripta.uz Brend Pill */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          padding: '10px 28px',
          borderRadius: 999,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#38BDF8',
            boxShadow: '0 0 12px #38BDF8',
          }}
        />
        <span
          style={{
            color: '#E2E8F0',
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 3,
          }}
        >
          SCRIPTA.UZ
        </span>
      </div>

      {/* 00:00.0 - 00:03.6: Intro */}
      <Sequence from={0} durationInFrames={sec(3.6)}>
        <IntroScene />
      </Sequence>

      {/* 00:03.6 - 00:18.3: So'zlar ketma-ketligi */}
      {VOCAB_LIST.map((item) => (
        <Sequence
          key={item.id}
          from={sec(item.startSec)}
          durationInFrames={sec(item.endSec - item.startSec)}
        >
          <VocabCardScene item={item} />
        </Sequence>
      ))}

      {/* 00:18.3 - 00:23.0: Interaktiv Outro */}
      <Sequence from={sec(18.3)} durationInFrames={sec(4.7)}>
        <OutroQuizScene />
      </Sequence>

      {/* Ovoz to'lqinlari vizualayzeri */}
      <VoiceWaveBar frame={frame} />

      {/* Pastki Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 64,
          width: '100%',
          textAlign: 'center',
          color: 'rgba(148, 163, 184, 0.65)',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 3,
        }}
      >
        IELTS LISTENING & SPELLING PLATFORM
      </div>
    </AbsoluteFill>
  );
};