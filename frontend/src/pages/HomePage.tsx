import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, MapPin, Navigation, QrCode, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useI18n } from '@/hooks/useI18n';
import { fetchHospitals } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { HospitalRow } from '@/types/aegis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveMap } from '@/components/map/LiveMap';

const QUICK = [
  'home.quick.chest',
  'home.quick.stroke',
  'home.quick.burns',
  'home.quick.bleed',
  'home.quick.seizure',
  'home.quick.fever',
  'home.quick.breath',
] as const;

const PROTOCOL_ROWS = [
  { titleKey: 'protocol.chest.title', bodyKey: 'protocol.chest.body', topic: 'cpr' },
  { titleKey: 'protocol.stroke.title', bodyKey: 'protocol.stroke.body', topic: 'stroke' },
  { titleKey: 'protocol.burns.title', bodyKey: 'protocol.burns.body', topic: 'burns' },
  { titleKey: 'protocol.bleed.title', bodyKey: 'protocol.bleed.body', topic: 'bleed' },
  { titleKey: 'protocol.seizure.title', bodyKey: 'protocol.seizure.body', topic: 'seizure' },
  { titleKey: 'protocol.breathing.title', bodyKey: 'protocol.breathing.body', topic: 'breathing' },
  { titleKey: 'protocol.fever.title', bodyKey: 'protocol.fever.body', topic: 'fever' },
  { titleKey: 'protocol.choking.title', bodyKey: 'protocol.choking.body', topic: 'choking' },
] as const;

export function HomePage() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const geo = useGeolocation(true);
  const hospitalsQ = useQuery({
    queryKey: ['hospitals-preview', geo.lat, geo.lng],
    queryFn: async () => {
      if (!geo.lat || !geo.lng) throw new Error('no-geo');
      return fetchHospitals(geo.lat, geo.lng);
    },
    enabled: Boolean(geo.lat && geo.lng),
    staleTime: 60_000,
  });
  const nearby = ((hospitalsQ.data?.hospitals || []) as HospitalRow[]).slice(0, 5);
  const profile = user?.profile;
  const locationLine =
    geo.lat != null && geo.lng != null
      ? `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}${geo.accuracy != null ? ` · ±${Math.round(geo.accuracy)} m` : ''}`
      : null;
  const qrPayload = JSON.stringify({
    n: user?.name,
    bg: profile?.bloodGroup,
    a: profile?.allergies,
    m: profile?.medications,
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-extrabold tracking-[0.25em] text-white/45">{t('home.command')}</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {t('home.welcome', { name: user?.name || '—' })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">{t('home.subtitle')}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('home.medicalIdentity')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                <div>
                  <div className="text-xs text-white/50">{t('home.bloodGroup')}</div>
                  <div className="mt-1 text-2xl font-extrabold">{profile?.bloodGroup || '—'}</div>
                </div>
                <Activity className="h-6 w-6 text-aegis-blue" />
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                <div className="text-xs text-white/50">{t('home.allergies')}</div>
                <div className="mt-2 text-sm font-semibold text-white/80">{(profile?.allergies || []).join(', ') || t('home.noneListed')}</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                <div className="text-xs text-white/50">{t('home.conditions')}</div>
                <div className="mt-2 text-sm font-semibold text-white/80">{(profile?.conditions || []).join(', ') || t('home.noneListed')}</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                <div className="text-xs text-white/50">{t('home.notes')}</div>
                <div className="mt-2 text-sm text-white/70">{profile?.notes || '—'}</div>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white/50">{t('home.qr')}</div>
                  <QrCode className="h-4 w-4 text-white/40" />
                </div>
                <div className="mt-3 grid place-items-center rounded-xl bg-white p-3">
                  <QRCodeSVG value={qrPayload} size={140} bgColor="#ffffff" fgColor="#000000" />
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                    <MapPin className="h-4 w-4 text-aegis-red" />
                    {t('home.liveLocation')}
                  </div>
                  <button
                    type="button"
                    onClick={() => geo.refresh()}
                    disabled={geo.loading}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-extrabold text-white/70 hover:bg-white/5 disabled:opacity-50"
                  >
                    <RefreshCw className={['h-3 w-3', geo.loading ? 'animate-spin' : ''].join(' ')} />
                    {t('hospitals.refreshGps')}
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/60">
                  {geo.error
                    ? geo.error
                    : hospitalsQ.data?.label || (geo.loading ? t('home.acquiringGps') : locationLine || t('home.acquiringGps'))}
                </p>
                {locationLine ? <p className="mt-1 font-mono text-[10px] text-white/40">{locationLine}</p> : null}
                {geo.lat && geo.lng ? <div className="mt-3"><LiveMap lat={geo.lat} lng={geo.lng} accuracyM={geo.accuracy} heightClass="h-[220px]" /></div> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('home.quickEmergencies')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {QUICK.map((labelKey) => (
              <Link key={labelKey} to="/risk" state={{ message: `${t('home.quick.statePrefix')}${t(labelKey)}` }}>
                <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3 text-sm font-extrabold text-white/85 hover:border-aegis-red/35">
                  {t(labelKey)}
                </motion.div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('home.nearbyTitle')}</CardTitle>
          <Link className="text-xs font-extrabold text-aegis-blue hover:underline" to="/hospitals">
            {t('home.nearbyLink')} →
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/60">
          {hospitalsQ.isLoading ? <p>{t('hospitals.lockingGps')}</p> : null}
          {hospitalsQ.isError ? <p className="text-aegis-warning">{t('hospitals.error')}</p> : null}
          {!hospitalsQ.isLoading && !hospitalsQ.isError && nearby.length === 0 ? (
            <p>{hospitalsQ.data?.warning || t('hospitals.empty')}</p>
          ) : null}
          {nearby.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3"
            >
              <div>
                <div className="font-extrabold text-white/90">{h.name}</div>
                <div className="text-xs text-white/50">
                  {(h.distanceKm * 1000).toFixed(0)} m · {h.type}
                </div>
              </div>
              <a
                href={h.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-extrabold text-white hover:bg-white/10"
              >
                <Navigation className="h-3 w-3" />
                {t('sos.directions')}
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('home.protocolsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/70">
          <p>{t('home.protocolsIntro')}</p>
          <ul className="space-y-3">
            {PROTOCOL_ROWS.map((row) => (
              <li key={row.titleKey} className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                <div className="font-extrabold text-white/90">{t(row.titleKey)}</div>
                <p className="mt-2 leading-relaxed text-white/65">{t(row.bodyKey)}</p>
                <Link className="mt-2 inline-block text-xs font-bold text-aegis-blue hover:underline" to={`/first-aid?topic=${row.topic}`}>
                  {t('home.openTopic')}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-white/55">
            {t('home.protocolsCtaOpen')}{' '}
            <Link className="text-aegis-blue hover:underline" to="/first-aid?topic=cpr">
              {t('home.protocolsFirstAid')}
            </Link>{' '}
            {t('home.protocolsCtaSuffix')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
