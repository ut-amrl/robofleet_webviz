import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from 'react-three-fiber';
import Pose from './Pose';
import { Color } from 'three';

/**
 * Sets up listeners for mouse events to handle setting poses from the Viz controls.
 * Supports click+drag to set a pose, while visualizing a phantom pose.
 */
export default function PoseSetter(props: {
  enabled: boolean;
  callback: (poseX: number, poseY: number, poseTheta: number) => void;
}) {
  const [poseLoc, setPoseLoc] = useState(new THREE.Vector3());
  const [theta, setTheta] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Handle mouse location tracking
  const three = useThree();
  if (!three)
    throw new Error(
      'PoseSetter must be rendered inside a react-three-fiber <Canvas> component.'
    );

  const pointerMoveEvent = useRef<PointerEvent | null>(null);

  // https://github.com/react-spring/react-three-fiber/blob/889e5734c5e64c951bde6d9b0b042f99449c3c15/src/canvas.tsx#L290
  // https://github.com/loganzartman/f1tenth-webviz/blob/master/src/index.js#L320
  const getNdcMousePos = useCallback(() => {
    const x = pointerMoveEvent.current?.clientX ?? 0;
    const y = pointerMoveEvent.current?.clientY ?? 0;
    const { left, right, top, bottom } = three.size;
    return new THREE.Vector3(
      ((x - left) / (right - left)) * 2 - 1,
      -(((y - top) / (bottom - top)) * 2 - 1),
      0
    );
  }, [three.size]);

  const getWorldMousePos = useCallback(() => {
    return getNdcMousePos().unproject(three.camera);
  }, [getNdcMousePos, three.camera]);

  // Handle pose setting mouse events
  const pointerDownHandler = useCallback(() => {
    if (!props.enabled) {
      return;
    }

    setDragging(true);
    setPoseLoc(getWorldMousePos());
  }, [getWorldMousePos, props.enabled]);

  const poseUpdateHandler = useCallback(
    (event: MouseEvent) => {
      if (!props.enabled) {
        return;
      }
      if (!dragging) return;
      event.stopPropagation();

      const pos = getWorldMousePos();
      const dragDx = pos.clone().sub(poseLoc);
      setTheta(Math.atan2(dragDx.y, dragDx.x));
    },
    [dragging, getWorldMousePos, poseLoc, props.enabled]
  );

  const pointerUpHandler = useCallback(() => {
    setDragging(false);
    if (!props.enabled) {
      return;
    }

    props.callback(poseLoc.x, poseLoc.y, theta);
  }, [poseLoc.x, poseLoc.y, props, theta]);

  const pointerMoveHandler = useCallback((event: PointerEvent) => {
    pointerMoveEvent.current = event;
  }, []);

  useEffect(
    function setupMouseHandlers() {
      document
        .querySelector('canvas')
        ?.addEventListener('pointerdown', pointerDownHandler);
      document
        .querySelector('canvas')
        ?.addEventListener('pointerUp', pointerUpHandler);
      document
        .querySelector('canvas')
        ?.addEventListener('pointermove', pointerMoveHandler);
      document
        .querySelector('canvas')
        ?.addEventListener('pointermove', poseUpdateHandler);

      return () => {
        document
          .querySelector('canvas')
          ?.removeEventListener('pointerdown', pointerDownHandler);
        document
          .querySelector('canvas')
          ?.removeEventListener('pointerUp', pointerUpHandler);
        document
          .querySelector('canvas')
          ?.removeEventListener('pointermove', pointerMoveHandler);
        document
          .querySelector('canvas')
          ?.removeEventListener('pointermove', poseUpdateHandler);
      };
    },
    [
      pointerDownHandler,
      pointerUpHandler,
      pointerMoveHandler,
      poseUpdateHandler,
    ]
  ); // this should really open happen once

  if (props.enabled && dragging) {
    return (
      <Pose
        x={poseLoc.x}
        y={poseLoc.y}
        theta={theta}
        materialProps={{
          color: new Color(0x3287a8),
          wireframe: true,
        }}
      />
    );
  } else {
    return <></>;
  }
}
