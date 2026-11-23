import React from 'react';
import { Composition } from 'remotion';
import { ReelsVideo } from './ReelsVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ReelsVideo"
        component={ReelsVideo}
        durationInFrames={720}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};