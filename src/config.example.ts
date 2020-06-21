export default {
  serverUrl: "ws://localhost:8080",
  mapUrl: (mapName: string) => `https://amrl.cs.utexas.edu/amrl_maps/${mapName}/${mapName}.vectormap.json`,
  timeTravelMaxCount: 128,
};
