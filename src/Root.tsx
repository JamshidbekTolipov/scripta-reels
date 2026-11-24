import React from 'react';
import { Composition } from 'remotion';
import { ReelsVideo } from './ReelsVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ReelsVideo"
        component={ReelsVideo}
        durationInFrames={1484}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};