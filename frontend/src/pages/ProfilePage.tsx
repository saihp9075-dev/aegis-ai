import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { saveProfile } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function Field({
  label,
  value,
  onChange,
  editLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editLabel: string;
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label>{label}</Label>
        <Input className="mt-2" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      <Button type="button" variant="ghost" size="icon" aria-label={editLabel}>
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProfilePage() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const [draft, setDraft] = useState(user?.profile);

  useEffect(() => {
    setDraft(user?.profile);
  }, [user?.profile]);

  const mut = useMutation({
    mutationFn: async () => saveProfile(draft || {}),
    onSuccess: (u) => {
      setUser(u);
      qc.invalidateQueries();
    },
  });

  if (!user || !draft) return null;

  const set = (patch: Partial<typeof draft>) => setDraft({ ...draft, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-extrabold tracking-[0.3em] text-white/45">{t('profile.kicker')}</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('profile.title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.operator')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-aegis-blue/35 to-aegis-red/25 text-xl font-extrabold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-extrabold">{user.name}</div>
              <div className="text-sm text-white/55">{user.email}</div>
            </div>
          </div>

          <Field label={t('profile.bloodGroup')} value={draft.bloodGroup} onChange={(v) => set({ bloodGroup: v })} editLabel={t('profile.edit')} />
          <Field label={t('profile.dob')} value={draft.dob} onChange={(v) => set({ dob: v })} editLabel={t('profile.edit')} />
          <Field
            label={t('profile.allergies')}
            value={(draft.allergies || []).join(', ')}
            onChange={(v) => set({ allergies: v.split(',').map((x) => x.trim()).filter(Boolean) })}
            editLabel={t('profile.edit')}
          />
          <Field
            label={t('profile.medications')}
            value={(draft.medications || []).join(', ')}
            onChange={(v) => set({ medications: v.split(',').map((x) => x.trim()).filter(Boolean) })}
            editLabel={t('profile.edit')}
          />
          <Field
            label={t('profile.conditions')}
            value={(draft.conditions || []).join(', ')}
            onChange={(v) => set({ conditions: v.split(',').map((x) => x.trim()).filter(Boolean) })}
            editLabel={t('profile.edit')}
          />
          <div>
            <Label>{t('profile.notes')}</Label>
            <textarea
              className="mt-2 min-h-[110px] w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none focus:border-aegis-blue/50"
              value={draft.notes}
              onChange={(e) => set({ notes: e.target.value })}
            />
          </div>

          <Button className="w-full" type="button" disabled={mut.isPending} onClick={() => mut.mutate()}>
            {t('profile.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
