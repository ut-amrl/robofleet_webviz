import React, { useEffect, useRef, useState } from 'react';
import { fb } from '../schema';

export default function CompressedImageViewer(props: {
  data: flatbuffers.ByteBuffer;
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

      const ci = fb.sensor_msgs.CompressedImage.getRootAsCompressedImage(
        props.data
      );
      const blob = new Blob([ci.dataArray() ?? new Uint8Array()], {
        type: `image/${ci.format()}`,
      });
      const bmp = await window.createImageBitmap(blob);
      if (size[0] !== bmp.width || size[1] !== bmp.height)
        setSize([bmp.width, bmp.height]);

      ctx.clearRect(0, 0, size[0], size[1]);
      ctx.drawImage(bmp, 0, 0);
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
