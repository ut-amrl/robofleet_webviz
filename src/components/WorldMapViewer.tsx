import React, { useCallback, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopicAnyNamespace } from '../util';
import { fb } from '../schema';

const coordsPattern = /(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*)/;
const defaultCenter: [number, number] = [30.288528, -97.737852];

export default function WorldMapViewer() {
  type MarkerTable = { [key: string]: [number, number, number] };
  const [markerTable, setMarkerTable] = useState<MarkerTable>({});

  useRobofleetMsgListener(
    matchTopicAnyNamespace('status'),
    useCallback((buf, topicMatch) => {
      const name = topicMatch[1];
      const status = fb.amrl_msgs.RobofleetStatus.getRootAsRobofleetStatus(buf);
      const loc = status.location();
      const coordsMatch = loc ? loc.match(coordsPattern) : null;
      if (coordsMatch) {
        console.log(coordsMatch);
        const lat = Number.parseFloat(coordsMatch[1]);
        const long = Number.parseFloat(coordsMatch[2]);
        const angle = Number.parseFloat(coordsMatch[3]);
        setMarkerTable((markerTable) => ({
          ...markerTable,
          [name]: [lat, long, angle],
        }));
      }
    }, [])
  );

  const markers = useMemo(
    () =>
      Object.entries(markerTable).map(([name, [lat, long, angle]]) => (
        <Marker position={[lat, long]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      )),
    [markerTable]
  );

  const markerCount = Object.keys(markerTable).length;
  const [centerLat, centerLong] = useMemo(
    () =>
      markerCount
        ? Object.values(
            markerTable
          ).reduce(([avgLat, avgLong], [lat, long]) => [
            avgLat + lat / markerCount,
            avgLong + long / markerCount,
            0,
          ])
        : defaultCenter,
    [markerCount, markerTable]
  );

  return (
    <MapContainer
      style={{ height: '400px' }}
      center={[centerLat, centerLong]}
      zoom={16}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers}
    </MapContainer>
  );
}
