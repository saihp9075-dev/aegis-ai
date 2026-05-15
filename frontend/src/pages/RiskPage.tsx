import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { triage } from '@/services/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useI18n } from '@/hooks/useI18n';
import { useUiStore } from '@/store/uiStore';
import type { TriageEnvelope } from '@/types/aegis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function RiskGlow({ level, confidence }: { level: string; confidence: number }) {
  const critical = level === 'CRITICAL';
  return (
    <motion.div
      animate={critical ? { boxShadow: ['0 0 0px rgba(255,59,48,0)', '0 0 40px rgba(255,59,48,0.45)', '0 0 0px rgba(255,59,48,0)'] } : {}}
      transition={{ repeat: critical ? Infinity : 0, duration: 1.2 }}
      className={['rounded-3xl border p-6', critical ? 'border-aegis-red/50 bg-aegis-red/10' : 'border-white/[0.06] bg-black/30'].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="font-display text-3xl font-extrabold tracking-tight">{level}</div>
        <Badge className="border-aegis-blue/30 text-aegis-blue">{(confidence * 100).toFixed(0)}%</Badge>
      </div>
    </motion.div>
  );
}

export function RiskPage() {
  const { t, lang } = useI18n();
  const loc = useLocation() as { state?: { message?: string } };
  const geo = useGeolocation(false);
  const setLast = useUiStore((s) => s.setLastEnvelope);
  const [msg, setMsg] = useState(loc.state?.message || '');
  const [env, setEnv] = useState<TriageEnvelope | null>(null);
  const [aiMeta, setAiMeta] = useState<{ source?: string; error?: string | null } | null>(null);
  const autoRan = useRef(false);

  useEffect(() => {
    if (loc.state?.message) setMsg(loc.state.message);
  }, [loc.state?.message]);

  const mut = useMutation({
    mutationFn: async () => triage(msg, geo.lat ?? undefined, geo.lng ?? undefined, lang),
    onSuccess: (d) => {
      setEnv(d.envelope);
      setLast(d.envelope);
      setAiMeta(d.meta || null);
    },
  });

  useEffect(() => {
    const initial = loc.state?.message?.trim();
    if (!initial || autoRan.current) return;
    autoRan.current = true;
    setMsg(initial);
    mut.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when opened from quick emergency card
  }, [loc.state?.message]);

  const e = env;
  const isOffline = aiMeta?.source === 'offline';

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-extrabold tracking-[0.3em] text-white/45">{t('risk.kicker')}</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('risk.title')}</h1>
        <p className="mt-2 text-sm text-white/60">{t('risk.sub')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('risk.input')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Input value={msg} onChange={(ev) => setMsg(ev.target.value)} placeholder={t('risk.placeholder')} />
          <Button type="button" className="md:w-44" disabled={!msg || mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? t('risk.analyzing') : t('risk.analyze')}
          </Button>
        </CardContent>
      </Card>

      {mut.isPending ? (
        <Card>
          <CardContent className="p-5 text-sm text-white/60">{t('risk.analyzing')}</CardContent>
        </Card>
      ) : null}

      {mut.isError ? (
        <Card>
          <CardContent className="p-5 text-sm text-aegis-warning">{t('risk.offline')}</CardContent>
        </Card>
      ) : null}

      {isOffline && e ? (
        <Card className="border-aegis-warning/30 bg-aegis-warning/10">
          <CardContent className="p-4 text-sm text-aegis-warning">
            {t('risk.offlineDetail')}
            {aiMeta?.error ? <span className="mt-2 block text-xs opacity-90">{aiMeta.error}</span> : null}
          </CardContent>
        </Card>
      ) : null}

      {e ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RiskGlow level={String(e.risk_level)} confidence={e.confidence_score} />
            <div className="mt-3 text-sm text-white/60">
              {t('risk.escalation')} {e.emergency_triggered ? t('risk.active') : t('risk.standby')}
            </div>
          </div>
          <div className="space-y-3 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('risk.why')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/75">{e.why_this_risk}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('risk.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/75">{e.medical_summary}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('risk.firstAid')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/75">{e.suggested_response}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('risk.action')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/75">{e.recommended_action}</CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
