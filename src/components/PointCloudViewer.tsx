import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from 'react-three-fiber';
import { Matrix4, Vector3 } from 'three';
import { fb } from '../schema';

const getFloatFromDataArray = (
  arr: Uint8Array,
  start: number,
  end: number,
  little_endian: boolean
) => {
  let view = new DataView(arr.slice(start, end).buffer);

  return view.getFloat32(0, little_endian);
};

export default function PointCloudViewer(props: {
  data: flatbuffers.ByteBuffer;
  enabled: boolean;
  point_skip_ratio: number;
  point_cloud_scale: number;
  max_intensity: number;
  large: boolean;
}) {
  const {
    point_skip_ratio,
    point_cloud_scale,
    max_intensity,
    data,
    large,
  } = props;
  const [pointData, setPointData] = useState(new Float32Array(0));
  const [pointIntensityData, setPointIntensityData] = useState(
    new Float32Array(0)
  );

  useEffect(() => {
    const cloud = fb.sensor_msgs.PointCloud2.getRootAsPointCloud2(data);

    // Identify the x, y, z fields from the cloud
    let xOffset: number | undefined;
    let yOffset: number | undefined;
    let zOffset: number | undefined;
    let intensityOffset: number | undefined;

    for (let i = 0; i < cloud.fieldsLength(); i++) {
      if (cloud.fields(i)?.name() === 'x') {
        xOffset = cloud.fields(i)?.offset();
      } else if (cloud.fields(i)?.name() === 'y') {
        yOffset = cloud.fields(i)?.offset();
      } else if (cloud.fields(i)?.name() === 'z') {
        zOffset = cloud.fields(i)?.offset();
      } else if (cloud.fields(i)?.name() === 'intensity') {
        intensityOffset = cloud.fields(i)?.offset();
      }
    }

    if (
      xOffset === undefined ||
      yOffset === undefined ||
      zOffset === undefined
    ) {
      console.warn('Unable to find required fields in point cloud data.');
      return;
    }

    const step = cloud.pointStep();
    let num_points = cloud.dataLength() / cloud.pointStep();
    num_points = num_points / point_skip_ratio;
    const points = new Float32Array(num_points * 3);
    const pointIntensity = new Float32Array(num_points * 3);

    for (let i = 0; i < num_points; i += point_skip_ratio) {
      const cloud_idx = i * step;
      const point_idx = i * 3;

      // assume fields are of length 4, and are float datatype
      points[point_idx + 0] = getFloatFromDataArray(
        cloud.dataArray()!,
        cloud_idx + xOffset,
        cloud_idx + xOffset + 4,
        !cloud.isBigendian()
      );
      points[point_idx + 1] = getFloatFromDataArray(
        cloud.dataArray()!,
        cloud_idx + yOffset,
        cloud_idx + yOffset + 4,
        !cloud.isBigendian()
      );
      points[point_idx + 2] = getFloatFromDataArray(
        cloud.dataArray()!,
        cloud_idx + zOffset,
        cloud_idx + zOffset + 4,
        !cloud.isBigendian()
      );
      if (intensityOffset) {
        pointIntensity[point_idx + 0] = 0.75;
        pointIntensity[point_idx + 1] = 0.75;
        pointIntensity[point_idx + 2] =
          getFloatFromDataArray(
            cloud.dataArray()!,
            cloud_idx + intensityOffset,
            cloud_idx + intensityOffset + 4,
            !cloud.isBigendian()
          ) / max_intensity;
      }
    }
    setPointData(points);
    setPointIntensityData(pointIntensity);
  }, [max_intensity, point_skip_ratio, data]);

  const pointsPosAttrib = useMemo(
    () => (
      <bufferAttribute
        attachObject={['attributes', 'position']}
        // can't use props; need to reconstruct to resize buffer
        args={[pointData, 3, false]}
        count={pointData.length / 3}
        onUpdate={(self) => {
          self.needsUpdate = true;
        }}
      />
    ),
    [pointData]
  );

  const pointsColorAttrib = useMemo(
    () => (
      <bufferAttribute
        attachObject={['attributes', 'color']}
        // can't use props; need to reconstruct to resize buffer
        args={[pointIntensityData, 3, false]}
        count={pointIntensityData.length / 3}
        onUpdate={(self) => {
          self.needsUpdate = true;
        }}
      />
    ),
    [pointIntensityData]
  );

  const T = useMemo(() => {
    let rot = new Matrix4().makeRotationAxis(
      new Vector3(1, 0, 0),
      -Math.PI / 3
    );
    rot = rot.multiply(
      new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), Math.PI / 2)
    );
    return rot.multiplyScalar(point_cloud_scale);
  }, [point_cloud_scale]);

  return (
    <Canvas
      style={{ height: large ? 600 : '100%', width: large ? 960 : '100%' }}
    >
      <points
        frustumCulled={false}
        matrixAutoUpdate={false}
        matrixWorldNeedsUpdate={true}
        matrix={T}
        visible={true}
      >
        <bufferGeometry attach="geometry">
          {pointsPosAttrib}
          {pointsColorAttrib}
        </bufferGeometry>
        <pointsMaterial
          attach="material"
          vertexColors={true}
          size={0.25}
          sizeAttenuation={false}
        />
      </points>
    </Canvas>
  );
}
