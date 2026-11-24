import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

// public/ papkasidagi video nomi
const VIDEO_FILE = 'video_1.mp4';

type CueEffect = 'none' | 'money10m' | 'money6m' | 'stamp-trans' | 'stamp-fake' | 'empire';

type SubtitleCue = {
  start: number;
  end: number;
  text: string;
  highlight?: string;
  bw?: boolean;
  zoom?: boolean;
  shake?: boolean;
  flash?: boolean;
  effect?: CueEffect;
};

const CUES: SubtitleCue[] = [
  {
    start: 0.0,
    end: 2.5,
    text: 'Hech kim ayta olmagan',
    highlight: 'GAPLARNI AYTAMIZ',
    zoom: true,
    flash: true,
  },
  {
    start: 2.5,
    end: 5.5,
    text: 'Love, otnosheniya, lyuboy narsa bu',
    highlight: 'TRANZAKSIYA',
    effect: 'stamp-trans',
    shake: true,
  },
  {
    start: 5.5,
    end: 8.5,
    text: 'Logistika sohasida bilgan ana shu ko‘rib o‘tiradi meni',
  },
  {
    start: 8.5,
    end: 11.0,
    text: 'Lyuboy kishi prosta tak',
    highlight: 'YAXSHI KO‘RMAYDI',
    zoom: true,
  },
  {
    start: 11.0,
    end: 13.5,
    text: 'Bir aytdim, ikki aytdim, uch aytdim',
    highlight: 'HECH KIM RAHM QILMAYDI',
    bw: true,
    zoom: true,
    flash: true,
  },
  {
    start: 13.5,
    end: 16.8,
    text: 'Men senga shuni orqasidan ishlab beraman',
    highlight: '$10 MILLION',
    effect: 'money10m',
    shake: true,
    flash: true,
  },
  {
    start: 16.8,
    end: 19.8,
    text: 'Lyuboy o‘yin bo‘lsa',
    highlight: 'OCHIQ-OYDIN KEL',
    zoom: true,
  },
  {
    start: 19.8,
    end: 23.0,
    text: 'Eng og‘riqli nuqtasi shundaki',
    highlight: 'XUDO SHUNI XOHISH QILDI',
    bw: true,
  },
  {
    start: 23.0,
    end: 25.0,
    text: 'Sen kim bilan o‘tirganingni',
    highlight: 'ENDI BILDING',
    zoom: true,
    shake: true,
  },
  {
    start: 25.0,
    end: 27.0,
    text: 'Bir oyda chiqarganman',
    highlight: '$6 MILLION',
    effect: 'money6m',
    shake: true,
    flash: true,
  },
  {
    start: 27.0,
    end: 29.5,
    text: 'Yuzini ko‘rsatsak, ota-onasiga',
    highlight: 'TAMOM DEYAPTI',
    zoom: true,
  },
  {
    start: 29.5,
    end: 33.5,
    text: 'Bir oyda $1000 topishni o‘rgatamiz deydi',
    highlight: 'U LOGISTIKA EMAS!',
    effect: 'stamp-fake',
    shake: true,
  },
  {
    start: 33.5,
    end: 36.0,
    text: 'Hammani birlashtirish — mana bu mening',
    highlight: 'IMPERIYAM',
    effect: 'empire',
    bw: true,
    zoom: true,
    flash: true,
  },
  {
    start: 36.0,
    end: 40.2,
    text: 'Bir oyda logistika o‘rgatamiz degan ustozlariga ham',
    highlight: 'MING LA’NAT',
    shake: true,
  },
  {
    start: 40.2,
    end: 42.2,
    text: 'Konsert berib yuribdi',
    highlight: 'TREYDERLAR',
  },
  {
    start: 42.2,
    end: 46.5,
    text: 'O‘yiniga rozi bo‘lmaganlarim — hozir kompaniyasi',
    highlight: 'YO‘Q',
    bw: true,
    zoom: true,
    flash: true,
  },
];

// 1. Pul hisoblagich (B-roll motion grafikasi)
const MoneyCounterOverlay: React.FC<{ target: number; cueFrame: number; fps: number }> = ({
  target,
  cueFrame,
  fps,
}) => {
  const pop = spring({ frame: cueFrame, fps, config: { damping: 11, stiffness: 180 } });
  const countProgress = interpolate(cueFrame, [0, 28], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const currentAmount = Math.floor(target * countProgress).toLocaleString('en-US');

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          transform: `scale(${pop}) rotate(-2deg)`,
          background: 'linear-gradient(135deg, rgba(220,38,38,0.25) 0%, rgba(15,23,42,0.92) 100%)',
          border: '4px solid #EF4444',
          borderRadius: 36,
          padding: '48px 64px',
          textAlign: 'center',
          boxShadow: '0 0 90px rgba(239, 68, 68, 0.55)',
        }}
      >
        <div
          style={{
            color: '#FCA5A5',
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 6,
            marginBottom: 12,
          }}
        >
          REAL NATIJA
        </div>
        <div
          style={{
            color: '#FFFFFF',
            fontSize: 108,
            fontWeight: 900,
            letterSpacing: -2,
            textShadow: '0 0 40px rgba(239, 68, 68, 0.9)',
          }}
        >
          ${currentAmount}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 2. Qizil muhr (Stamp) animatsiyasi
const StampOverlay: React.FC<{ label: string; sub: string; cueFrame: number; fps: number }> = ({
  label,
  sub,
  cueFrame,
  fps,
}) => {
  const slam = spring({
    frame: Math.max(0, cueFrame - 10),
    fps,
    config: { damping: 10, stiffness: 260 },
  });
  const scale = interpolate(slam, [0, 1], [2.6, 1]);
  const opacity = interpolate(slam, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 240,
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) rotate(-8deg)`,
          border: '10px solid #DC2626',
          backgroundColor: 'rgba(15, 0, 0, 0.85)',
          padding: '28px 54px',
          borderRadius: 20,
          textAlign: 'center',
          boxShadow: '0 0 70px rgba(220, 38, 38, 0.7)',
        }}
      >
        <div
          style={{
            color: '#EF4444',
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: 4,
            lineHeight: 1.05,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: '#FFFFFF',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 5,
            marginTop: 10,
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3. So'zma-so'z dinamik subtitr
const WordByWordSubtitle: React.FC<{
  cue: SubtitleCue;
  cueFrame: number;
  durationFrames: number;
  fps: number;
}> = ({ cue, cueFrame, durationFrames, fps }) => {
  const words = cue.text.split(' ');
  const framesPerWord = Math.max(3, Math.floor((durationFrames * 0.65) / words.length));
  const highlightStart = Math.floor(durationFrames * 0.45);
  const highlightPop = spring({
    frame: Math.max(0, cueFrame - highlightStart),
    fps,
    config: { damping: 11, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 60px 230px 60px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px 16px',
          marginBottom: cue.highlight ? 24 : 0,
        }}
      >
        {words.map((word, i) => {
          const wordStart = i * framesPerWord;
          const visible = cueFrame >= wordStart;
          const isCurrent = cueFrame >= wordStart && cueFrame < wordStart + framesPerWord + 4;
          const wordPop = spring({
            frame: Math.max(0, cueFrame - wordStart),
            fps,
            config: { damping: 14, stiffness: 240 },
          });

          if (!visible) return null;

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                color: isCurrent ? '#FDE047' : '#FFFFFF',
                fontSize: 56,
                fontWeight: 900,
                textTransform: 'uppercase',
                transform: `scale(${interpolate(wordPop, [0, 1], [0.6, isCurrent ? 1.08 : 1])})`,
                textShadow: '0 8px 24px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,1)',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {cue.highlight && cueFrame >= highlightStart && (
        <div
          style={{
            transform: `scale(${interpolate(highlightPop, [0, 1], [0.5, 1])}) rotate(-1.5deg)`,
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: 66,
            fontWeight: 900,
            letterSpacing: 2,
            padding: '14px 36px',
            borderRadius: 18,
            boxShadow: '0 0 45px rgba(220, 38, 38, 0.85), 0 12px 30px rgba(0,0,0,0.8)',
          }}
        >
          {cue.highlight}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const ReelsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentSec = frame / fps;

  const activeCue = CUES.find((c) => currentSec >= c.start && currentSec < c.end);
  const cueFrame = activeCue ? Math.max(0, frame - sec(activeCue.start)) : 0;
  const cueDuration = activeCue ? sec(activeCue.end - activeCue.start) : 30;

  // Kamera titrashi (Camera shake)
  const shakeIntensity =
    activeCue?.shake && cueFrame < 12
      ? interpolate(cueFrame, [0, 12], [14, 0], { extrapolateRight: 'clamp' })
      : 0;
  const shakeX = Math.sin(frame * 3.7) * shakeIntensity;
  const shakeY = Math.cos(frame * 4.3) * shakeIntensity;

  // Keskin zoom
  const zoomScale = activeCue?.zoom
    ? interpolate(cueFrame, [0, cueDuration], [1.06, 1.18], { extrapolateRight: 'clamp' })
    : 1.04;

  // Flash (chaqnash) effekti
  const flashOpacity =
    activeCue?.flash && cueFrame < 8
      ? interpolate(cueFrame, [0, 8], [0.75, 0], { extrapolateRight: 'clamp' })
      : 0;

  // Kino qora chiziqlari (dramatik joylarda yopiladi)
  const barHeight = activeCue?.bw
    ? interpolate(cueFrame, [0, 10], [0, 140], { extrapolateRight: 'clamp' })
    : 0;

  const progress = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        fontFamily: 'Inter, Impact, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Asosiy video qatlami */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${zoomScale})`,
          filter: activeCue?.bw
            ? 'grayscale(100%) contrast(135%) brightness(85%)'
            : 'contrast(112%) saturate(115%)',
        }}
      >
        <OffthreadVideo
          src={staticFile(VIDEO_FILE)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
      </AbsoluteFill>

      {/* Kinematografik vinyetka va qizil nur */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Maxsus Motion-Grafika qatlamlari */}
      {activeCue?.effect === 'money10m' && (
        <MoneyCounterOverlay target={10000000} cueFrame={cueFrame} fps={fps} />
      )}
      {activeCue?.effect === 'money6m' && (
        <MoneyCounterOverlay target={6000000} cueFrame={cueFrame} fps={fps} />
      )}
      {activeCue?.effect === 'stamp-trans' && (
        <StampOverlay label="TRANZAKSIYA" sub="BIZNES QONUNI" cueFrame={cueFrame} fps={fps} />
      )}
      {activeCue?.effect === 'stamp-fake' && (
        <StampOverlay label="LOGISTIKA EMAS!" sub="YOLG‘ON VA’DALAR" cueFrame={cueFrame} fps={fps} />
      )}

      {/* Kino qora chiziqlari (Letterbox) */}
      {barHeight > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: barHeight,
              backgroundColor: '#000000',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: barHeight,
              backgroundColor: '#000000',
            }}
          />
        </>
      )}

      {/* So'zma-so'z dinamik subtitrlar */}
      {activeCue && (
        <WordByWordSubtitle
          cue={activeCue}
          cueFrame={cueFrame}
          durationFrames={cueDuration}
          fps={fps}
        />
      )}

      {/* Yuqori progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 48,
          right: 48,
          height: 8,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#EF4444',
            boxShadow: '0 0 16px #EF4444',
          }}
        />
      </div>

      {/* Flash (o'tish chaqnashi) */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};