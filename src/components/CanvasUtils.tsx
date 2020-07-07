import React, { Ref, useEffect, useImperativeHandle, useRef } from 'react';
import { useThree } from 'react-three-fiber';
import { Vector3 } from 'three';

export interface CanvasUtilsProps {}
export interface CanvasUtilsRef {
  worldMousePos: Vector3;
}

/**
 * A utility component for exporting information from a react-three-fiber
 * Canvas. Consume by rendering it inside a <Canvas> and attaching a ref,
 * then imperatively accessing properties on the ref.
 */
function CanvasUtils(props: CanvasUtilsProps, ref: Ref<CanvasUtilsRef>) {
  const three = useThree();
  if (!three)
    throw new Error(
      'CanvasUtils must be rendered inside a react-three-fiber <Canvas> component.'
    );

  const pointerMoveEvent = useRef<PointerEvent | null>(null);

  // https://github.com/react-spring/react-three-fiber/blob/889e5734c5e64c951bde6d9b0b042f99449c3c15/src/canvas.tsx#L290
  // https://github.com/loganzartman/f1tenth-webviz/blob/master/src/index.js#L320
  const getNdcMousePos = () => {
    const x = pointerMoveEvent.current?.clientX ?? 0;
    const y = pointerMoveEvent.current?.clientY ?? 0;
    const { left, right, top, bottom } = three.size;
    return new Vector3(
      ((x - left) / (right - left)) * 2 - 1,
      -(((y - top) / (bottom - top)) * 2 - 1),
      0
    );
  };

  // react-three-fiber has lots of built-in things for mouse events on objects
  // that are raycast-able, but we want *all* move events.
  useEffect(() => {
    const handler = (event: PointerEvent) => {
      pointerMoveEvent.current = event;
    };
    document.body.addEventListener('pointermove', handler);
    return () => document.body.removeEventListener('pointermove', handler);
  }, []);

  // required reading:
  // https://reactjs.org/docs/hooks-reference.html#useimperativehandle
  useImperativeHandle(ref, () => {
    // you can add more things inside this object
    // you will have to update the interface definition
    const refObj: CanvasUtilsRef = {
      get worldMousePos() {
        return getNdcMousePos().unproject(three.camera);
      },
    };
    return refObj;
  });

  // just using this to element to render inside of <Canvas>, no need to
  // generate anything useful here
  return <group name="CanvasUtils dummy" ref={ref} />;
}

// see required reading above
export default React.forwardRef(CanvasUtils);
