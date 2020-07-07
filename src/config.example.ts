export default {
  serverUrl: 'ws://localhost:8080',
  mapUrl: (mapName: string) =>
    `https://amrl.cs.utexas.edu/amrl_maps/${mapName}/${mapName}.vectormap.json`,
  // get a Google Client OAuth ID as documented here:
  // https://developers.google.com/identity/sign-in/web/sign-in#create_authorization_credentials
  // note that you *can* configure it to support localhost; specify this on the
  // "Credentials" page and use some real domain on the "Consent screen" page.
  googleClientId: null,
};
