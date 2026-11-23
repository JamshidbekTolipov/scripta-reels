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

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

// public/ papkasiga tashlagan fayl nomingni yoz (masalan: '1rav_V1.mp4' yoki 'audio.mp3')
const VOICE_FILE = '1rav_V1.mp4';
const USE_SFX = false;

const ITEMS = [
  {
    num: '01',
    bad: 'For example',
    good: 'For instance, this can be clearly seen in...',
    startSec: 3.5,
    endSec: 9.5,
    goodDelaySec: 1.5,
  },
  {
    num: '02',
    bad: 'Firstly',
    good: 'One of the main reasons for this is that...',
    startSec: 9.5,
    endSec: 14.0,
    goodDelaySec: 1.2,
  },
  {
    num: '03',
    bad: 'Secondly',
    good: 'Another significant point to consider is...',
    startSec: 14.0,
    endSec: 18.5,
    goodDelaySec: 1.2,
  },
  {
    num: '04',
    bad: 'Because',
    good: 'The particular reason for the circumstance...',
    startSec: 18.5,
    endSec: 22.2,
    goodDelaySec: 1.1,
  },
  {
    num: '05',
    bad: 'In conclusion',
    good: 'To sum up, the arguments discussed above clearly indicate that...',
    startSec: 22.2,
    endSec: 28.0,
    goodDelaySec: 1.3,
  },
];

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
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.5} />}
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
        <span style={{ color: '#38BDF8' }}>TOP 5 ta</span> so‘z
      </h1>
    </AbsoluteFill>
  );
};

const CardScene: React.FC<{
  num: string;
  bad: string;
  good: string;
  goodDelaySec: number;
}> = ({ num, bad, good, goodDelaySec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = sec(goodDelaySec);
  const badSlide = spring({ frame, fps, config: { damping: 15 } });
  const strikeWidth = interpolate(frame, [delayFrames - 12, delayFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const goodPop = spring({
    frame: Math.max(0, frame - delayFrames),
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
      {USE_SFX && <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.4} />}
      {USE_SFX && (
        <Sequence from={delayFrames}>
          <Audio src={staticFile('sfx/pop.mp3')} volume={0.6} />
        </Sequence>
      )}

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

const TextSlide: React.FC<{ text: string; highlight?: string; showCTA?: boolean }> = ({
  text,
  highlight,
  showCTA,
}) => {
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
      <div style={{ transform: `scale(${pop})` }}>
        {!showCTA ? (
          <p
            style={{
              color: '#F8FAFC',
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            {text}{' '}
            {highlight && <span style={{ color: '#38BDF8' }}>{highlight}</span>}
          </p>
        ) : (
          <>
            <div
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: 48,
                fontWeight: 800,
                padding: '32px 56px',
                borderRadius: 28,
                display: 'inline-block',
                marginBottom: 44,
              }}
            >
              {text}
            </div>
            <div
              style={{
                color: '#38BDF8',
                fontSize: 46,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              scripta.uz
            </div>
          </>
        )}
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
      {/* Asl video audiosi */}
      <Audio src={staticFile(VOICE_FILE)} volume={1} />

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

      {/* 00:00 - 00:03.5 Intro */}
      <Sequence from={0} durationInFrames={sec(3.5)}>
        <IntroScene />
      </Sequence>

      {/* 00:03.5 - 00:28.0 TOP 5 ibora */}
      {ITEMS.map((item) => (
        <Sequence
          key={item.num}
          from={sec(item.startSec)}
          durationInFrames={sec(item.endSec - item.startSec)}
        >
          <CardScene
            num={item.num}
            bad={item.bad}
            good={item.good}
            goodDelaySec={item.goodDelaySec}
          />
        </Sequence>
      ))}

      {/* 00:28.0 - 00:35.0 Outro 1 */}
      <Sequence from={sec(28.0)} durationInFrames={sec(7.0)}>
        <TextSlide
          text="Bu so‘zlar idea kelmay qolganida va so‘zlaringiz kam bo‘lganida"
          highlight="yordam beradi."
        />
      </Sequence>

      {/* 00:35.0 - 00:38.5 Outro 2 */}
      <Sequence from={sec(35.0)} durationInFrames={sec(3.5)}>
        <TextSlide
          text="Agar sizda idea yetarli bo‘lsa,"
          highlight="foydalanishingiz shart emas."
        />
      </Sequence>

      {/* 00:38.5 - 00:41.8 Outro 3 (CTA) */}
      <Sequence from={sec(38.5)} durationInFrames={sec(3.3)}>
        <TextSlide text="Yo‘qotib qo‘ymaslik uchun saqlab qo‘ying 📌" showCTA />
      </Sequence>
    </AbsoluteFill>
  );
};