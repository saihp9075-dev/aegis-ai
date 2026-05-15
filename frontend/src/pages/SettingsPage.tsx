import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Bell, ChevronDown, ChevronRight, Globe, Moon, MoveHorizontal, Type } from 'lucide-react';
import { saveSettings } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';
import { mergeUserSettings } from '@/lib/settingsDefaults';
import type { UserSettings } from '@/types/aegis';
import { translate } from '@/i18n/strings';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const LANG_IDS = ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'zh', 'ja'] as const;

function RowCard({
  icon,
  title,
  desc,
  right,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  right: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0B0B0F] px-4 py-3.5 transition hover:border-white/[0.1]">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-black/40 text-white/80">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-white">{title}</div>
          {desc ? <div className="mt-1 text-xs leading-relaxed text-white/55">{desc}</div> : null}
        </div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function LegalRow({ title }: { title: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#0B0B0F] px-4 py-3.5 text-left transition hover:border-white/[0.1]"
    >
      <span className="text-sm font-extrabold text-white">{title}</span>
      <ChevronRight className="h-4 w-4 text-white/35" />
    </button>
  );
}

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const { t, lang: uiLang } = useI18n();

  const s = useMemo(() => mergeUserSettings(user?.settings), [user?.settings]);

  const [alertDraft, setAlertDraft] = useState({
    telegramChatId: '',
    telegramGroupId: '',
    alertEmail: '',
  });

  useEffect(() => {
    if (!user?.settings) return;
    setAlertDraft({
      telegramChatId: user.settings.telegramChatId || '',
      telegramGroupId: user.settings.telegramGroupId || '',
      alertEmail: user.settings.alertEmail || '',
    });
  }, [user?.settings]);

  const quickSave = useMutation({
    mutationFn: (patch: Partial<UserSettings>) => saveSettings(patch),
    onSuccess: (u) => {
      setUser(u);
      qc.invalidateQueries();
    },
  });

  const saveAlerts = useMutation({
    mutationFn: () =>
      saveSettings({
        telegramChatId: alertDraft.telegramChatId,
        telegramGroupId: alertDraft.telegramGroupId,
        alertEmail: alertDraft.alertEmail,
      }),
    onSuccess: (u) => {
      setUser(u);
      qc.invalidateQueries();
    },
  });

  if (!user) return null;

  const langLabel = (id: string) => translate(uiLang, `lang.${id}`);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="text-xs font-extrabold tracking-[0.3em] text-white/45">{t('settings.preferencesKicker')}</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('settings.title')}</h1>
      </div>

      {quickSave.isError ? <p className="text-sm font-semibold text-aegis-red">{t('settings.saveError')}</p> : null}

      <section className="space-y-2">
        <div className="text-[11px] font-extrabold tracking-[0.22em] text-white/40">{t('settings.sectionLanguage')}</div>
        <Card className="border-white/[0.06] bg-[#0B0B0F]">
          <CardContent className="p-4">
            <RowCard
              icon={<Globe className="h-5 w-5" />}
              title={t('settings.language')}
              desc={t('settings.languageDesc')}
              right={
                <div className="relative w-[160px]">
                  <select
                    className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-black/50 px-3 pr-9 text-xs font-extrabold text-white outline-none focus:border-aegis-blue/40"
                    value={s.language}
                    disabled={quickSave.isPending}
                    onChange={(e) => quickSave.mutate({ language: e.target.value })}
                  >
                    {LANG_IDS.map((id) => (
                      <option key={id} value={id}>
                        {langLabel(id)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                </div>
              }
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <div className="text-[11px] font-extrabold tracking-[0.22em] text-white/40">{t('settings.sectionDisplay')}</div>
        <div className="grid gap-2">
          <RowCard
            icon={<Moon className="h-5 w-5" />}
            title={t('settings.darkMode')}
            desc={t('settings.darkModeDesc')}
            right={
              <Switch checked={Boolean(s.darkMode)} disabled={quickSave.isPending} onCheckedChange={(v) => quickSave.mutate({ darkMode: v })} />
            }
          />
          <RowCard
            icon={<Type className="h-5 w-5" />}
            title={t('settings.largeText')}
            desc={t('settings.largeTextDesc')}
            right={
              <Switch checked={Boolean(s.largeText)} disabled={quickSave.isPending} onCheckedChange={(v) => quickSave.mutate({ largeText: v })} />
            }
          />
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[11px] font-extrabold tracking-[0.22em] text-white/40">{t('settings.sectionRecipients')}</div>
        <Card className="border-white/[0.06] bg-[#0B0B0F]">
          <CardContent className="grid gap-5 p-4">
            <div>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-black/40">
                  <Bell className="h-5 w-5 text-white/80" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white">{t('settings.telegramChat')}</div>
                  <p className="mt-1 text-xs text-white/55">{t('settings.telegramChatDesc')}</p>
                  <Input className="mt-3" value={alertDraft.telegramChatId} onChange={(e) => setAlertDraft((d) => ({ ...d, telegramChatId: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-black/40">
                  <MoveHorizontal className="h-5 w-5 text-white/80" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white">{t('settings.telegramGroup')}</div>
                  <p className="mt-1 text-xs text-white/55">{t('settings.telegramGroupDesc')}</p>
                  <Input className="mt-3" placeholder="e.g. -400123…" value={alertDraft.telegramGroupId} onChange={(e) => setAlertDraft((d) => ({ ...d, telegramGroupId: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-black/40">
                  <Globe className="h-5 w-5 text-white/80" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white">{t('settings.alertEmail')}</div>
                  <p className="mt-1 text-xs text-white/55">{t('settings.alertEmailDesc')}</p>
                  <Input className="mt-3" type="email" placeholder="someone@example.com" value={alertDraft.alertEmail} onChange={(e) => setAlertDraft((d) => ({ ...d, alertEmail: e.target.value }))} />
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-white/45">{t('settings.telegramHelp')}</p>
          </CardContent>
        </Card>
      </section>

      <Button className="h-12 w-full rounded-2xl font-extrabold" type="button" disabled={saveAlerts.isPending} onClick={() => saveAlerts.mutate()}>
        {saveAlerts.isPending ? t('settings.saving') : t('settings.saveRecipients')}
      </Button>
      {saveAlerts.isError ? <p className="text-center text-sm text-aegis-red">{t('settings.saveError')}</p> : null}

      <section className="space-y-2">
        <div className="text-[11px] font-extrabold tracking-[0.22em] text-white/40">{t('settings.sectionLegal')}</div>
        <div className="grid gap-2">
          <LegalRow title={t('settings.privacy')} />
          <LegalRow title={t('settings.terms')} />
          <LegalRow title={t('settings.help')} />
        </div>
      </section>

      <div className="pt-4 text-center text-xs text-white/40">{t('settings.footer')}</div>
    </div>
  );
}
