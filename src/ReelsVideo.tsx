import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// public/sfx/ papkasiga whoosh.mp3 va pop.mp3 tashlaganingdan keyin buni true qil
const USE_SFX = false;

const ITEMS = [
  {
    num: '01',
    bad: 'For example',
    good: 'For instance, this can be clearly seen in...',
  },
  {
    num: '02',
    bad: 'Firstly',
    good: 'One of the main reasons for this is that...',
  },
  {
    num: '03',
    bad: 'Secondly',
    good: 'Another significant point to consider is...',
  },
  {
    num: '04',
    bad: 'Because',
    good: 'The particular reason for this circumstance is...',
  },
  {
    num: '05',
    bad: 'In conclusion',
    good: 'To sum up, the arguments discussed above clearly indicate that...',
  },
];

const INTRO_DURATION = 90; // 3 soniya
const ITEM_DURATION = 105; // har bir ibora 3.5 soniya
const OUTRO_DURATION = 105; // 3.5 soniya

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const badgeOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        textAlign: 'center',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.6} />}
      <div
        style={{
          opacity: badgeOpacity,
          backgroundColor: 'rgba(59, 130, 246, 0.18)',
          border: '2px solid #3B82F6',
          color: '#60A5FA',
          padding: '14px 36px',
          borderRadius: 999,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 3,
          marginBottom: 48,
        }}
      >
        IELTS WRITING
      </div>
      <h1
        style={{
          transform: `scale(${scale})`,
          color: '#F8FAFC',
          fontSize: 82,
          fontWeight: 900,
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        Essay uzunroq bo‘lishi uchun{' '}
        <span style={{ color: '#38BDF8' }}>TOP 5 ta</span> ibora
      </h1>
    </AbsoluteFill>
  );
};

const CardScene: React.FC<{ num: string; bad: string; good: string }> = ({
  num,
  bad,
  good,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badSlide = spring({ frame, fps, config: { damping: 15 } });
  const strikeWidth = interpolate(frame, [15, 30], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const goodPop = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 70px',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.5} />}
      {USE_SFX && (
        <Sequence from={28}>
          <Audio src={staticFile('sfx/pop.mp3')} volume={0.7} />
        </Sequence>
      )}

      {/* Raqam */}
      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: '#64748B',
          letterSpacing: 4,
          marginBottom: 30,
        }}
      >
        {num} / 05
      </div>

      {/* Eski / oddiy ibora */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid rgba(239, 68, 68, 0.45)',
          borderRadius: 32,
          padding: '44px 48px',
          marginBottom: 40,
          transform: `translateY(${(1 - badSlide) * 60}px)`,
          opacity: badSlide,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#F87171',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          ❌ ODDIY
        </div>
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            color: '#E2E8F0',
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          {bad}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '52%',
              height: 6,
              width: `${strikeWidth}%`,
              backgroundColor: '#EF4444',
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      {/* Yangi / akademik ibora */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(14, 165, 233, 0.14)',
          border: '3px solid #38BDF8',
          borderRadius: 36,
          padding: '54px 48px',
          transform: `scale(${goodPop})`,
          opacity: goodPop,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(56, 189, 248, 0.2)',
        }}
      >
        <div
          style={{
            color: '#38BDF8',
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 2,
            marginBottom: 20,
          }}
        >
          ✅ AKADEMIK VARIANT
        </div>
        <div
          style={{
            color: '#FFFFFF',
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 1.3,
          }}
        >
          “{good}”
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        textAlign: 'center',
      }}
    >
      {USE_SFX && <Audio src={staticFile('sfx/pop.mp3')} volume={0.6} />}
      <div style={{ transform: `scale(${pop})` }}>
        <p
          style={{
            color: '#CBD5E1',
            fontSize: 46,
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: 56,
          }}
        >
          Idea kelmay qolganida va so‘zlar kam bo‘lganida yordam beradi.
        </p>
        <div
          style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: 44,
            fontWeight: 800,
            padding: '28px 56px',
            borderRadius: 24,
            display: 'inline-block',
            marginBottom: 40,
          }}
        >
          Yo‘qotib qo‘ymaslik uchun saqlab qo‘ying 📌
        </div>
        <div
          style={{
            color: '#38BDF8',
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          scripta.uz
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 20%, #0F172A 0%, #020617 100%)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Yuqori progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          right: 60,
          height: 10,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#38BDF8',
          }}
        />
      </div>

      {/* Pastki watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          width: '100%',
          textAlign: 'center',
          color: 'rgba(148, 163, 184, 0.6)',
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 3,
        }}
      >
        @SCRIPTA.UZ
      </div>

      <Sequence from={0} durationInFrames={INTRO_DURATION}>
        <IntroScene />
      </Sequence>

      {ITEMS.map((item, idx) => (
        <Sequence
          key={item.num}
          from={INTRO_DURATION + idx * ITEM_DURATION}
          durationInFrames={ITEM_DURATION}
        >
          <CardScene num={item.num} bad={item.bad} good={item.good} />
        </Sequence>
      ))}

      <Sequence
        from={INTRO_DURATION + ITEMS.length * ITEM_DURATION}
        durationInFrames={OUTRO_DURATION}
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};