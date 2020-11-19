import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from 'react-three-fiber';
import { Matrix4, Vector3 } from 'three';
import { fb } from '../schema';

const FLOAT32 = 7;

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
      if (
        cloud.fields(i)?.name() === 'x' &&
        cloud.fields(i)?.datatype() === FLOAT32
      ) {
        xOffset = cloud.fields(i)?.offset();
      } else if (
        cloud.fields(i)?.name() === 'y' &&
        cloud.fields(i)?.datatype() === FLOAT32
      ) {
        yOffset = cloud.fields(i)?.offset();
      } else if (
        cloud.fields(i)?.name() === 'z' &&
        cloud.fields(i)?.datatype() === FLOAT32
      ) {
        zOffset = cloud.fields(i)?.offset();
      } else if (
        cloud.fields(i)?.name() === 'intensity' &&
        cloud.fields(i)?.datatype() === FLOAT32
      ) {
        intensityOffset = cloud.fields(i)?.offset();
      }
    }

    if (
      xOffset === undefined ||
      yOffset === undefined ||
      zOffset === undefined
    ) {
      console.warn(
        'Unable to find required fields in point cloud data, or they did not have the correct datatype.'
      );
      return;
    }

    const step = cloud.pointStep();
    let num_points = cloud.dataLength() / cloud.pointStep();
    num_points = num_points / point_skip_ratio;
    const points = new Float32Array(num_points * 3);
    const pointIntensity = new Float32Array(num_points * 3);
    let dataView = new DataView(cloud.dataArray()!.buffer);
    const little_endian = !cloud.isBigendian();

    for (let i = 0; i < num_points; i += point_skip_ratio) {
      const cloud_idx = i * step;
      const point_idx = i * 3;

      // assume fields are of length 4, and are float datatype
      // Note: We need  to use the `subarray` method to figure out the right byte offset because of JS type buffer issues.
      let bo = cloud.dataArray()!.subarray(cloud_idx + xOffset).byteOffset;
      points[point_idx + 0] = dataView.getFloat32(bo, little_endian);
      bo = cloud.dataArray()!.subarray(cloud_idx + yOffset).byteOffset;
      points[point_idx + 1] = dataView.getFloat32(bo, little_endian);
      bo = cloud.dataArray()!.subarray(cloud_idx + zOffset).byteOffset;
      points[point_idx + 2] = dataView.getFloat32(bo, little_endian);
      if (intensityOffset) {
        pointIntensity[point_idx + 0] = 0.75;
        pointIntensity[point_idx + 1] = 0.75;
        bo = cloud.dataArray()!.subarray(cloud_idx + intensityOffset)
          .byteOffset;
        pointIntensity[point_idx + 2] =
          dataView.getFloat32(bo, little_endian) / max_intensity;
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
    <Canvas style={{ height: large ? 600 : 200, width: large ? 960 : 320 }}>
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
