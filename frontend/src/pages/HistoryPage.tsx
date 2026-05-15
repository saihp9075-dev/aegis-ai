import { useQuery } from '@tanstack/react-query';
import { FileText, Mail, Send } from 'lucide-react';
import { fetchHistory, downloadIncidentPdf } from '@/services/api';
import { useI18n } from '@/hooks/useI18n';
import { BCP47_LOCALE } from '@/i18n/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HistoryItem, TriageEnvelope } from '@/types/aegis';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUiStore } from '@/store/uiStore';

function riskTone(r: string) {
  const u = String(r || '').toUpperCase();
  if (u === 'CRITICAL') return 'text-aegis-red';
  if (u === 'HIGH') return 'text-orange-400';
  return 'text-white/70';
}

export function HistoryPage() {
  const { t, lang } = useI18n();
  const geo = useGeolocation(false);
  const lastEnvelope = useUiStore((s) => s.lastEnvelope);
  const q = useQuery({ queryKey: ['history'], queryFn: () => fetchHistory() as Promise<HistoryItem[]> });

  const items = (q.data || []) as HistoryItem[];

  const onPdf = async (h: HistoryItem) => {
    const blob = await downloadIncidentPdf({
      historyId: h.id,
      symptoms: h.summary,
      envelope: (h.payload as TriageEnvelope | undefined) || lastEnvelope,
      lat: geo.lat,
      lng: geo.lng,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aegis-report.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-extrabold tracking-[0.3em] text-white/45">{t('history.kicker')}</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('history.title')}</h1>
        <p className="mt-2 text-sm text-white/60">{t('history.sub')}</p>
      </div>

      <div className="grid gap-3">
        {items.map((h) => (
          <Card key={h.id} className="border-white/[0.06] bg-[#0B0B0F] transition hover:border-white/[0.1]">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[0.06] bg-black/40">
                  <FileText className="h-6 w-6 text-aegis-red" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg font-extrabold text-white">{h.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                    <span>
                      {t('history.incidentId')}: {h.id}
                    </span>
                    <span className={`font-extrabold ${riskTone(h.risk)}`}>{h.risk}</span>
                    <span>{new Date(h.createdAt).toLocaleString(BCP47_LOCALE[lang] || BCP47_LOCALE.en)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Send className="h-4 w-4 text-white/40" />
                      {t('history.telegram')} <span className="font-semibold">{h.telegramStatus}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-white/40" />
                      {t('history.email')} <span className="font-semibold">{h.emailStatus}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="outline" className="rounded-2xl font-extrabold" onClick={() => onPdf(h)}>
                  {t('history.report')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!q.isLoading && items.length === 0 ? (
          <Card className="border-white/[0.06] bg-[#0B0B0F]">
            <CardContent className="p-6 text-sm text-white/60">{t('history.empty')}</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
