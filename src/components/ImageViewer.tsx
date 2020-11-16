import React, { useEffect, useRef, useState } from 'react';

export default function CompressedImageViewer(props: {
  image: ImageBitmap;
  enabled: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState([0, 0]);

  useEffect(() => {
    if (!props.enabled) return;
    (async () => {
      if (canvas.current === null) return;
      const ctx = canvas.current.getContext('2d');
      if (ctx === null) return;
      if (size[0] !== props.image.width || size[1] !== props.image.height)
        setSize([props.image.width, props.image.height]);
      ctx.clearRect(0, 0, size[0], size[1]);
      ctx.drawImage(props.image, 0, 0);
    })();
  });

  return (
    <canvas
      ref={canvas}
      width={size[0]}
      height={size[1]}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );
}
