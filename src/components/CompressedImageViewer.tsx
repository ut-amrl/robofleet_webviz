import React, { useState, useCallback, useEffect, useLayoutEffect, ReactElement, useRef } from "react";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { matchTopic } from "../util";
import { fb } from "../schema";

export default function CompressedImageViewer(props: {namespace: string, topic: string, enabled: boolean}) {
  const { namespace } = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = useRef(null as CanvasRenderingContext2D | null);
  const [size, setSize] = useState([0, 0]);
  
  useRobofleetMsgListener(matchTopic(namespace, props.topic), useCallback((buf, match) => {
    if (!props.enabled)
      return;
    (async () => {
      if (ctx.current === null)
        return;
      const ci = fb.sensor_msgs.CompressedImage.getRootAsCompressedImage(buf);
      const blob = new Blob(
        [ci.dataArray() ?? new Uint8Array()], 
        {type: `image/${ci.format()}`}
      );
      const bmp = await window.createImageBitmap(blob);
      if (size[0] !== bmp.width || size[1] !== bmp.height)
        setSize([bmp.width, bmp.height]);
      ctx.current.clearRect(0, 0, size[0], size[1]);
      ctx.current.drawImage(bmp, 0, 0);
    })();
  }, [props.enabled]));

  useEffect(() => {
    if (canvas.current === null)
      return;
    ctx.current = canvas.current.getContext("2d");
  }, [canvas.current]);
  
  return <canvas 
    ref={canvas} 
    width={size[0]} 
    height={size[1]}
    style={{maxWidth: "100%", maxHeight: "100%"}}
  />;
}
