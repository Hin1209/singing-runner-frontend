import React, { useEffect, useRef } from 'react';

const PlaySongsSimultaneously: React.FC = () => {
  const songFiles = [
    // '/music/snowflower_origin.wav',
    // '/music/snowflower_3keydown.wav',
    // '/music/snowflower_3keyup.wav',
    // '/music/snowflower_5keyup.wav',
    // '/music/snowflower_2keyup.wav',
    // '/music/snowflower_8keyup.wav',
    '/music/snowflower_vocal_origin.wav',
    '/music/snowflower_vocal_3keydown.wav',
    '/music/snowflower_vocal_3keyup.wav',
    // '/music/snowflower_origin.wav',
    // '/music/snowflower_3keydown.wav',
    // '/music/snowflower_3keyup.wav',
  ];

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodes = useRef<GainNode[]>([]);
  const sources = useRef<AudioBufferSourceNode[]>([]);
  
  useEffect(() => {
    // If not running in the browser, don't execute the rest of the code
    if (typeof window === 'undefined') return;

    // Create AudioContext
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();

    // Use the created AudioContext
    const audioCtx = audioCtxRef.current;

    Promise.all(songFiles.map((file) => fetch(file).then(res => res.arrayBuffer())))
      .then(datas => Promise.all(datas.map(data => audioCtx.decodeAudioData(data))))
      .then(buffers => {
        gainNodes.current = songFiles.map((_, i) => {
          const gainNode = audioCtx.createGain();
          gainNode.gain.value = 0; // Start all audios muted
          const source = audioCtx.createBufferSource();
          source.buffer = buffers[i];
          source.connect(gainNode).connect(audioCtx.destination);
          source.loop = true;
          source.start();
          sources.current[i] = source;
          return gainNode;
        });
      });

    // Cleanup function to stop all songs
    return () => {
      sources.current.forEach((source) => {
        source.stop();
      });
      gainNodes.current = [];
      sources.current = [];
    };
  }, [songFiles]);

  const handleSolo = (index: number) => {
    gainNodes.current.forEach((gainNode, i) => {
      gainNode.gain.value = i === index ? 1 : 0;
    });
  };

  return (
    <div>
      {songFiles.map((_, index) => (
        <button key={index} onClick={() => handleSolo(index)}>
          Solo {index + 1}
        </button>
      ))}
    </div>
  );
};

export default PlaySongsSimultaneously;
