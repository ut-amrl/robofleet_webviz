import React, { useState, useCallback, useEffect, useLayoutEffect, ReactElement, useRef } from "react";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { matchTopic } from "../util";
import { fb } from "../schema";

export default function CompressedImageViewer(props: {namespace: string, topic: string, enabled: boolean}) {
  const { namespace } = props;
  const img = useRef<HTMLImageElement>(null);
  const [blob, setBlob] = useState(null as Blob | null);
  const [imgSrc, setImgSrc] = useState("");
  
  useRobofleetMsgListener(matchTopic(namespace, props.topic), useCallback((buf, match) => {
    if (!props.enabled)
      return;
    const ci = fb.sensor_msgs.CompressedImage.getRootAsCompressedImage(buf);
    const blob = new Blob(
      [ci.dataArray() ?? new Uint8Array()], 
      {type: `image/${ci.format()}`}
    );
    setBlob(blob);
  }, [props.enabled]));

  useEffect(() => {
    if (blob === null)
      return;
    const src = URL.createObjectURL(blob);
    setImgSrc(src);
    return () => {
      URL.revokeObjectURL(imgSrc);
    };
  }, [blob]);
  
  return <img ref={img} src={imgSrc} style={{maxWidth: "100%", maxHeight: "100%"}}/>; 
}
