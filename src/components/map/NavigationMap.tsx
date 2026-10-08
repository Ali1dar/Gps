import Mapbox, { Camera, FillExtrusionLayer, LocationPuck, MapView, type CameraRef } from '@rnmapbox/maps';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { ENV } from '../../config/env';
import { useLocationStore } from '../../store/locationStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { LocationFix } from '../../types/location';
import {
  BUILDING_COLORS,
  CAMERA_ANIM_MS,
  DEFAULT_CENTER,
  STYLE_URLS,
  pitchForSpeed,
  zoomForSpeed,
} from './mapConfig';

Mapbox.setAccessToken(ENV.MAPBOX_PUBLIC_TOKEN);

/**
 * Renders the map and drives the follow-camera.
 *
 * Performance notes:
 *  - The camera is driven by a *non-React* store subscription, so a 1 Hz location stream
 *    causes ZERO React re-renders of this component.
 *  - The blue puck is the native Mapbox LocationPuck (interpolated on the render thread),
 *    so it stays smooth even if JS is busy.
 *  - Animation mode is `linearTo` with a duration equal to the GPS interval, giving
 *    continuous motion instead of a hop every second.
 */
function NavigationMapBase() {
  const cameraRef = useRef<CameraRef>(null);
  const { height } = useWindowDimensions();

  const mapStyle = useSettingsStore((s) => s.mapStyle);
  const followMode = useSettingsStore((s) => s.followMode);
  const setFollowMode = useSettingsStore((s) => s.setFollowMode);
  const initial = useLocationStore.getState().lastKnown;

  const pushCamera = useCallback(
    (fix: LocationFix, durationMs: number) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [fix.longitude, fix.latitude],
        heading: fix.headingDeg,
        pitch: pitchForSpeed(fix.speedMps),
        zoomLevel: zoomForSpeed(fix.speedMps),
        // Pushes the puck into the lower third of the screen, like Waze / Google Maps.
        padding: { paddingTop: 0, paddingBottom: Math.round(height * 0.3), paddingLeft: 0, paddingRight: 0 },
        animationDuration: durationMs,
        animationMode: 'linearTo',
      });
    },
    [height],
  );

  useEffect(() => {
    if (followMode !== 'follow') return undefined;

    const current = useLocationStore.getState().fix;
    if (current) pushCamera(current, 600); // snap back smoothly after "recenter"

    return useLocationStore.subscribe((state, prev) => {
      if (state.fix && state.fix !== prev.fix) pushCamera(state.fix, CAMERA_ANIM_MS);
    });
  }, [followMode, pushCamera]);

  return (
    <MapView
      style={styles.map}
      styleURL={STYLE_URLS[mapStyle]}
      scaleBarEnabled={false}
      compassEnabled={false}
      rotateEnabled
      pitchEnabled
      // Leaving "follow" the moment the user drags/pinches lets them explore freely.
      onCameraChanged={(state) => {
        if (state.gestures?.isGestureActive && followMode === 'follow') setFollowMode('free');
      }}
    >
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: initial ? [initial.longitude, initial.latitude] : DEFAULT_CENTER,
          heading: initial?.headingDeg ?? 0,
          zoomLevel: 16,
          pitch: 50,
        }}
      />

      <FillExtrusionLayer
        id="buildings-3d"
        sourceID="composite"
        sourceLayerID="building"
        minZoomLevel={15}
        filter={['==', ['get', 'extrude'], 'true']}
        style={{
          fillExtrusionHeight: ['get', 'height'],
          fillExtrusionBase: ['get', 'min_height'],
          fillExtrusionColor: BUILDING_COLORS[mapStyle],
          fillExtrusionOpacity: 0.75,
        }}
      />

      <LocationPuck
        puckBearing="course"
        puckBearingEnabled
        pulsing={{ isEnabled: true }}
      />
    </MapView>
  );
}

export const NavigationMap = memo(NavigationMapBase);

const styles = StyleSheet.create({
  map: { flex: 1 },
});
