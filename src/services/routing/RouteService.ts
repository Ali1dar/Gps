export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

export interface RouteData {
  coordinates: [number, number][];
  durationMinutes: number;
  distanceKm: string;
  steps: RouteStep[];
}

export class RouteService {
  private static MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  static async fetchRoute(
    origin: [number, number],
    destination: [number, number]
  ): Promise<RouteData | null> {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&steps=true&overview=full&access_token=${this.MAPBOX_TOKEN}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        return null;
      }

      const primaryRoute = data.routes[0];
      
      return {
        coordinates: primaryRoute.geometry.coordinates,
        durationMinutes: Math.round(primaryRoute.duration / 60),
        distanceKm: (primaryRoute.distance / 1000).toFixed(1),
        steps: primaryRoute.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch route:', error);
      return null;
    }
  }
}
