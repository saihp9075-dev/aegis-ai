import { useCallback, useEffect, useRef, useState } from 'react';

export type GeoState = {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  mapsUrl: string;
  loading: boolean;
};

function applyPosition(
  prev: GeoState,
  pos: GeolocationPosition
): GeoState {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const accuracy = pos.coords.accuracy;
  const next: GeoState = {
    lat,
    lng,
    accuracy,
    error: null,
    mapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
    loading: false,
  };
  if (
    prev.lat != null &&
    prev.lng != null &&
    prev.accuracy != null &&
    accuracy > prev.accuracy * 1.35
  ) {
    return { ...prev, loading: false };
  }
  return next;
}

export function useGeolocation(watch: boolean) {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    mapsUrl: '',
    loading: true,
  });
  const idRef = useRef<number | null>(null);
  const watchRef = useRef(watch);
  watchRef.current = watch;

  const clearWatch = useCallback(() => {
    if (idRef.current != null) {
      navigator.geolocation.clearWatch(idRef.current);
      idRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported', loading: false }));
      return;
    }
    clearWatch();
    setState((s) => ({ ...s, loading: true, error: null }));

    const onOk: PositionCallback = (pos) => {
      setState((prev) => applyPosition(prev, pos));
    };
    const onErr: PositionErrorCallback = (e) => {
      setState((s) => ({
        ...s,
        error: e.message || 'Location error',
        loading: false,
      }));
    };
    const opts: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 30_000,
    };

    if (watchRef.current) {
      idRef.current = navigator.geolocation.watchPosition(onOk, onErr, opts);
    } else {
      navigator.geolocation.getCurrentPosition(onOk, onErr, opts);
    }
  }, [clearWatch]);

  const refresh = useCallback(() => {
    start();
  }, [start]);

  useEffect(() => {
    start();
    return clearWatch;
  }, [watch, start, clearWatch]);

  return { ...state, refresh };
}
