# GeoDrive AI

## Directory structure (all phases; Phase 1 files are implemented)

```
geodrive-ai/
├── index.ts                     # registers background task, then root component   [P1]
├── app.config.ts                # Mapbox + location plugins, permissions           [P1]
├── eas.json  babel.config.js  tsconfig.json  .env.example                         [P1]
└── src/
    ├── App.tsx                  # bootstrap: permissions -> tracking               [P1]
    ├── config/env.ts                                                               [P1]
    ├── types/location.ts                                                           [P1]
    ├── storage/mmkv.ts          # MMKV + zustand adapter                           [P1]
    ├── store/
    │   ├── locationStore.ts     # latest fix, permission, last-known (persisted)   [P1]
    │   ├── settingsStore.ts     # map style (persisted), follow mode               [P1]
    │   ├── routeStore.ts        # active route, maneuvers                          [P2]
    │   └── alertsStore.ts       # live hazards                                     [P3]
    ├── services/
    │   ├── location/
    │   │   ├── LocationService.ts     # permissions, fg watcher, bg service        [P1]
    │   │   ├── LocationProcessor.ts   # accuracy/speed/heading filtering           [P1]
    │   │   ├── ingest.ts  constants.ts  backgroundTask.ts  geo.ts                  [P1]
    │   ├── routing/             # OSRM / Mapbox Directions, route scoring          [P2]
    │   ├── guidance/            # maneuver state machine, off-route detection      [P2]
    │   ├── realtime/            # Socket.io client, geofenced alert sync           [P3]
    │   ├── voice/               # recorder, intent parsing                         [P4]
    │   └── vision/              # vision-camera frame processors                   [P4+]
    ├── components/
    │   ├── map/
    │   │   ├── NavigationMap.tsx      # map, puck, follow-camera, 3D buildings     [P1]
    │   │   ├── MapStyleSwitcher.tsx   # night / day / satellite                    [P1]
    │   │   ├── mapConfig.ts                                                        [P1]
    │   │   ├── RouteLayer.tsx                                                      [P2]
    │   │   └── HazardMarkers.tsx                                                   [P3]
    │   ├── guidance/            # maneuver banner, lane guidance                   [P2]
    │   ├── reporting/           # report bottom sheet                              [P3]
    │   └── hud/                 # speedometer, ETA banner                          [P5]
    ├── screens/MapScreen.tsx                                                       [P1]
    └── utils/
```

## Setup

```bash
cp .env.example .env        # fill in both Mapbox tokens
npm install
npx expo install --fix      # aligns native module versions with your Expo SDK
eas build --profile development --platform android
npm start                   # then open the installed dev build
```

Mapbox needs native code, so this will NOT run in Expo Go - use the EAS dev build.
