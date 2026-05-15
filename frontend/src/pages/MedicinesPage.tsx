import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlarmClock, Bell, Home, Hospital, Pill, Plus, Settings, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { createMedicine, deleteMedicine, fetchMedicines, patchMedicine, testTelegram } from '@/services/api';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Med = {
  id: string;
  name: string;
  dose?: string;
  frequency?: string;
  reminderTime?: string;
  time?: string;
  telegram?: boolean;
  active?: boolean;
};

export function MedicinesPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['meds'], queryFn: () => fetchMedicines() as Promise<Med[]> });
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('09:00');
  const [toast, setToast] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: async () =>
      createMedicine({
        name,
        dose: dose || '',
        reminderTime: time,
        frequency: 'everyday',
        telegram: true,
        active: true,
      }),
    onSuccess: async () => {
      setName('');
      setDose('');
      await qc.invalidateQueries({ queryKey: ['meds'] });
    },
  });

  const toggle = useMutation({
    mutationFn: async (m: Med) => patchMedicine(m.id, { active: !m.active }),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['meds'] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => deleteMedicine(id),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['meds'] }),
  });

  const tgTest = useMutation({
    mutationFn: () => testTelegram(),
    onSuccess: (d) => {
      setToast(d.ok ? t('meds.testOk') : `${t('meds.testFail')}: ${d.error || d.status}`);
      window.setTimeout(() => setToast(null), 4500);
    },
    onError: () => {
      setToast(t('meds.testFail'));
      window.setTimeout(() => setToast(null), 4500);
    },
  });

  const meds = (q.data || []) as Med[];

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-extrabold tracking-[0.3em] text-white/45">{t('meds.kicker')}</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('meds.title')}</h1>
          <p className="mt-2 text-xs font-extrabold tracking-[0.28em] text-white/45">{t('meds.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-dashed border-white/25 bg-transparent font-extrabold"
            disabled={tgTest.isPending}
            onClick={() => tgTest.mutate()}
          >
            {t('meds.testTelegram')}
          </Button>
          <motion.button
            type="button"
            aria-label={t('meds.addShortcut')}
            className="grid h-14 w-14 place-items-center rounded-full bg-aegis-red text-white shadow-[0_0_32px_rgba(255,59,48,0.45)]"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('med-name')?.focus()}
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {toast ? (
        <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-2 text-center text-sm font-semibold text-white/80">{toast}</div>
      ) : null}

      <div className="rounded-[22px] border border-white/[0.06] bg-[#0B0B0F] p-5 shadow-float">
        <div className="text-sm font-extrabold text-white">{t('meds.addTitle')}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>{t('meds.name')}</Label>
            <Input id="med-name" className="mt-2 rounded-2xl" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('meds.placeholder')} />
          </div>
          <div>
            <Label>{t('meds.dose')}</Label>
            <Input className="mt-2 rounded-2xl" value={dose} onChange={(e) => setDose(e.target.value)} placeholder={t('meds.dosePlaceholder')} />
          </div>
          <div>
            <Label>{t('meds.reminderTime')}</Label>
            <Input className="mt-2 rounded-2xl" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <Button className="rounded-2xl font-extrabold" type="button" disabled={!name || add.isPending} onClick={() => add.mutate()}>
            {t('meds.saveReminder')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {meds.map((m) => (
          <div
            key={m.id}
            className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0B0B0F] p-5 shadow-float transition hover:border-white/[0.1]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/[0.06] bg-black/40">
                  <Pill className="h-7 w-7 text-aegis-red" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold text-white">{m.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                    <span className="inline-flex items-center gap-1">
                      <AlarmClock className="h-3.5 w-3.5" />
                      {m.reminderTime || m.time || '—'}
                      {m.dose ? <span className="text-white/35">•</span> : null}
                      {m.dose ? <span className="font-bold text-white/70">{m.dose}</span> : null}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bell className="h-3.5 w-3.5" />
                      {t('meds.telegram')} {m.telegram ? t('meds.telegramOn') : t('meds.telegramOff')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 md:flex-col md:items-end">
                <Switch checked={Boolean(m.active)} onCheckedChange={() => toggle.mutate(m)} />
                <button
                  type="button"
                  className="text-white/35 transition hover:text-aegis-red"
                  aria-label={t('meds.delete')}
                  onClick={() => del.mutate(m.id)}
                  disabled={del.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[10px] font-extrabold tracking-[0.2em]">
              <span className="rounded-full border border-white/[0.08] bg-black/40 px-3 py-1 text-white/50">{(m.frequency || 'everyday').toUpperCase()}</span>
              <span className={m.active ? 'text-aegis-red' : 'text-white/40'}>{m.active ? t('meds.activeVigilance') : t('meds.inactive')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-end justify-around px-2 pb-3 pt-2 text-[10px] font-extrabold tracking-wide text-white/55">
          <Link to="/" className="grid min-w-[64px] place-items-center gap-1 text-white/70 hover:text-white">
            <Home className="h-5 w-5" />
            {t('meds.footerDashboard')}
          </Link>
          <Link to="/hospitals" className="grid min-w-[64px] place-items-center gap-1 hover:text-white">
            <Hospital className="h-5 w-5" />
            {t('nav.hospitals')}
          </Link>
          <div className="relative -mt-8 grid min-w-[72px] place-items-center">
            <Link to="/sos" aria-label={t('nav.sos')}>
              <motion.div
                className="grid h-16 w-16 place-items-center rounded-full bg-aegis-red text-white shadow-[0_0_40px_rgba(255,59,48,0.55)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="text-lg font-black">!</span>
              </motion.div>
            </Link>
          </div>
          <div className="grid min-w-[64px] place-items-center gap-1 text-aegis-red">
            <Bell className="h-5 w-5 drop-shadow-[0_0_12px_rgba(255,59,48,0.45)]" />
            {t('meds.footerReminders')}
          </div>
          <Link to="/settings" className="grid min-w-[64px] place-items-center gap-1 hover:text-white">
            <Settings className="h-5 w-5" />
            {t('nav.settings')}
          </Link>
        </div>
      </div>
    </div>
  );
}
