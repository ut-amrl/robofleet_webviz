import React, { useState, useCallback, useEffect } from "react";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { matchTopic } from "../util";
import { fb } from "../schema";

export default function CompressedImageViewer(props: {namespace: string, topic: string}) {
  const { namespace } = props;
  const [blob, setBlob] = useState(null as Blob | null);
  const [imgSrc, setImgSrc] = useState("");
  
  useRobofleetMsgListener(matchTopic(namespace, props.topic), useCallback((buf, match) => {
    const ci = fb.sensor_msgs.CompressedImage.getRootAsCompressedImage(buf);
    const blob = new Blob(
      [ci.dataArray() ?? new Uint8Array()], 
      {type: `image/${ci.format()}`}
    );
    setBlob(blob);
  }, []));

  useEffect(() => {
    if (blob === null)
      return;
    const src = URL.createObjectURL(blob);
    setImgSrc(src);
    return () => {
      URL.revokeObjectURL(imgSrc);
    };
  }, [blob]);
  
  return <img src={imgSrc}/>; 
}
