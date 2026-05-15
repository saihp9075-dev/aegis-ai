import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Navigation, RefreshCw } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useI18n } from '@/hooks/useI18n';
import { fetchHospitals } from '@/services/api';
import type { HospitalRow } from '@/types/aegis';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveMap } from '@/components/map/LiveMap';

export function HospitalsPage() {
  const { t } = useI18n();
  const geo = useGeolocation(true);
  const q = useQuery({
    queryKey: ['hospitals', geo.lat, geo.lng],
    queryFn: async () => {
      if (!geo.lat || !geo.lng) throw new Error('no-geo');
      return fetchHospitals(geo.lat, geo.lng);
    },
    enabled: Boolean(geo.lat && geo.lng),
    refetchInterval: 60_000,
  });

  const rows = (q.data?.hospitals || []) as HospitalRow[];
  const addressLabel = q.data?.label;
  const subtitle =
    addressLabel ||
    (geo.error ? geo.error : geo.loading ? t('hospitals.lockingGps') : t('hospitals.lockingGps'));

  const coordLine =
    geo.lat != null && geo.lng != null
      ? `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}${geo.accuracy != null ? ` · ±${Math.round(geo.accuracy)} m` : ''}`
      : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold tracking-[0.3em] text-white/45">{t('hospitals.kicker')}</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('hospitals.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">{subtitle}</p>
          {coordLine ? <p className="mt-1 font-mono text-xs text-white/45">{coordLine}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => geo.refresh()}
          disabled={geo.loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={['h-4 w-4', geo.loading ? 'animate-spin' : ''].join(' ')} />
          {t('hospitals.refreshGps')}
        </button>
      </div>

      {geo.lat && geo.lng ? (
        <LiveMap lat={geo.lat} lng={geo.lng} accuracyM={geo.accuracy} heightClass="h-[420px]" />
      ) : (
        <Skeleton className="h-[420px] w-full" />
      )}

      <div className="grid gap-3">
        {q.isLoading ? <Skeleton className="h-24 w-full" /> : null}
        {q.isError ? (
          <Card>
            <CardContent className="p-5 text-sm text-aegis-warning">{t('hospitals.error')}</CardContent>
          </Card>
        ) : null}
        {!q.isLoading && !q.isError && rows.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-white/60">{q.data?.warning || t('hospitals.empty')}</CardContent>
          </Card>
        ) : null}
        {rows.map((h) => (
          <Card key={h.id}>
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-display text-lg font-extrabold">{h.name}</div>
                <div className="mt-1 text-xs text-white/55">{h.type}</div>
                <div className="mt-2 text-sm font-semibold text-white/70">{(h.distanceKm * 1000).toFixed(0)} m</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/10"
                  href={h.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="h-4 w-4" />
                  {t('sos.directions')}
                </a>
                {h.osmUrl ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/10"
                    href={h.osmUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('hospitals.osm')}
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}