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

type SubtitleCue = {
  start: number;
  end: number;
  text: string;
  highlight?: string; // Qizil plashka yoki nur bilan ajratiladigan so'z
  style?: 'normal' | 'red-box' | 'red-glow';
  bw?: boolean; // Oq-qora (dramatik) effekt
  zoom?: boolean; // Sekin yaqinlashtirish
};

const CUES: SubtitleCue[] = [
  {
    start: 0.0,
    end: 2.5,
    text: 'Hech kim ayta olmagan',
    highlight: 'GAPLARNI AYTAMIZ',
    style: 'red-box',
    zoom: true,
  },
  {
    start: 2.5,
    end: 5.5,
    text: 'Love, otnosheniya, lyuboy narsa bu —',
    highlight: 'TRANZAKSIYA',
    style: 'red-glow',
  },
  {
    start: 5.5,
    end: 8.5,
    text: 'Logistika sohasida bilgan ana shu ko‘rib o‘tiradi meni.',
    style: 'normal',
  },
  {
    start: 8.5,
    end: 11.0,
    text: 'Lyuboy kishi prosta tak',
    highlight: 'YAXSHI KO‘RMAYDI',
    style: 'red-box',
  },
  {
    start: 11.0,
    end: 13.5,
    text: 'Bir aytdim, ikki aytdim, uch aytdim —',
    highlight: 'HECH KIM RAHM QILMAYDI',
    style: 'red-glow',
    bw: true,
    zoom: true,
  },
  {
    start: 13.5,
    end: 16.8,
    text: 'Men senga shuni orqasidan ishlab beraman —',
    highlight: '$10 MILLION',
    style: 'red-glow',
    zoom: true,
  },
  {
    start: 16.8,
    end: 19.8,
    text: 'Lyuboy o‘yin bo‘lsa,',
    highlight: 'OCHIQ-OYDIN KEL',
    style: 'red-box',
  },
  {
    start: 19.8,
    end: 23.0,
    text: 'Eng og‘riqli nuqtasi shundaki —',
    highlight: 'XUDO SHUNI XOHISH QILDI',
    style: 'normal',
    bw: true,
  },
  {
    start: 23.0,
    end: 25.0,
    text: 'Sen kim bilan o‘tirganingni',
    highlight: 'ENDI BILDING',
    style: 'red-box',
  },
  {
    start: 25.0,
    end: 27.0,
    text: 'Bir oyda chiqarganman —',
    highlight: '$6 MILLION',
    style: 'red-glow',
    zoom: true,
  },
  {
    start: 27.0,
    end: 29.5,
    text: 'Yuzini ko‘rsatsak, ota-onasiga',
    highlight: 'TAMOM DEYAPTI',
    style: 'red-box',
  },
  {
    start: 29.5,
    end: 33.5,
    text: 'Bir oyda $1000 topishni o‘rgatamiz deydi.',
    highlight: 'U LOGISTIKA EMAS!',
    style: 'red-glow',
  },
  {
    start: 33.5,
    end: 36.0,
    text: 'Hammani birlashtirish — mana bu mening',
    highlight: 'IMPERIYAM',
    style: 'red-glow',
    bw: true,
    zoom: true,
  },
  {
    start: 36.0,
    end: 40.2,
    text: 'Bir oyda logistika o‘rgatamiz degan ustozlariga ham',
    highlight: 'MING LA’NAT',
    style: 'red-box',
  },
  {
    start: 40.2,
    end: 42.2,
    text: 'Konsert berib yuribdi',
    highlight: 'TREYDERLAR',
    style: 'normal',
  },
  {
    start: 42.2,
    end: 46.0,
    text: 'O‘yiniga rozi bo‘lmaganlarim — hozir kompaniyasi',
    highlight: 'YO‘Q',
    style: 'red-glow',
    bw: true,
    zoom: true,
  },
];

export const ReelsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentSec = frame / fps;

  const activeCue = CUES.find(
    (c) => currentSec >= c.start && currentSec < c.end
  );

  // Kadr ichidagi vaqt (animatsiya uchun)
  const cueFrame = activeCue ? Math.max(0, frame - sec(activeCue.start)) : 0;
  const pop = spring({
    frame: cueFrame,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  // Zoom effekti (16:9 videoni 9:16 ga to'ldirib turish + muhim joylarda yaqinlashtirish)
  const zoomScale = activeCue?.zoom
    ? interpolate(
        cueFrame,
        [0, sec(activeCue.end - activeCue.start)],
        [1.04, 1.14],
        { extrapolateRight: 'clamp' }
      )
    : 1.02;

  const progress = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        fontFamily: 'Inter, Impact, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Asl video (9:16 ga moslab kesilgan + oq-qora va zoom effektlari) */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoomScale})`,
          filter: activeCue?.bw
            ? 'grayscale(100%) contrast(125%) brightness(90%)'
            : 'contrast(108%) saturate(110%)',
          transition: 'filter 0.15s ease',
        }}
      >
        <OffthreadVideo
          src={staticFile('video_1.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
      </AbsoluteFill>

      {/* Pastki va yuqori qorong'u gradient (subtitrlar aniq o'qilishi uchun) */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* Yuqori progress bar (qizil podcast uslubida) */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 56,
          right: 56,
          height: 8,
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#EF4444',
          }}
        />
      </div>

      {/* Dinamik Subtitrlar */}
      {activeCue && (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 64px 260px 64px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              transform: `scale(${interpolate(pop, [0, 1], [0.88, 1])}) translateY(${interpolate(
                pop,
                [0, 1],
                [24, 0]
              )}px)`,
              opacity: pop,
            }}
          >
            {/* Oddiy matn qismi */}
            <div
              style={{
                color: '#FFFFFF',
                fontSize: 54,
                fontWeight: 800,
                lineHeight: 1.22,
                textShadow: '0 6px 24px rgba(0,0,0,0.95)',
                marginBottom: activeCue.highlight ? 18 : 0,
              }}
            >
              {activeCue.text}
            </div>

            {/* Ajratib ko'rsatiladigan kuchli so'z */}
            {activeCue.highlight && (
              <div
                style={{
                  display: 'inline-block',
                  fontSize: activeCue.style === 'red-glow' ? 74 : 62,
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  padding:
                    activeCue.style === 'red-box' ? '12px 32px' : '4px 12px',
                  borderRadius: activeCue.style === 'red-box' ? 16 : 0,
                  backgroundColor:
                    activeCue.style === 'red-box' ? '#DC2626' : 'transparent',
                  color:
                    activeCue.style === 'red-glow' ? '#EF4444' : '#FFFFFF',
                  textShadow:
                    activeCue.style === 'red-glow'
                      ? '0 0 36px rgba(239, 68, 68, 0.9), 0 4px 16px rgba(0,0,0,0.95)'
                      : '0 4px 14px rgba(0,0,0,0.6)',
                  boxShadow:
                    activeCue.style === 'red-box'
                      ? '0 12px 32px rgba(220, 38, 38, 0.5)'
                      : 'none',
                }}
              >
                {activeCue.highlight}
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};