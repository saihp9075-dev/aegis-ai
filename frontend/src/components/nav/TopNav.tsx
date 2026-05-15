import { NavLink } from 'react-router-dom';
import { Activity, Bell, Heart, Home, Hospital, LogOut, Pill, Settings, Siren } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/hooks/useI18n';

const links: { to: string; labelKey: string; icon: typeof Home }[] = [
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/sos', labelKey: 'nav.sos', icon: Siren },
  { to: '/hospitals', labelKey: 'nav.hospitals', icon: Hospital },
  { to: '/medicines', labelKey: 'nav.medicines', icon: Pill },
  { to: '/history', labelKey: 'nav.history', icon: Activity },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function TopNav() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-3 transition hover:opacity-95">
          <motion.div
            className="grid h-10 w-10 place-items-center rounded-2xl bg-aegis-red shadow-[0_0_32px_rgba(255,59,48,0.22)]"
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
          >
            <Heart className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
          </motion.div>
          <div>
            <div className="font-display text-[13px] font-extrabold tracking-wide text-white">{t('nav.brand')}</div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-white/40">{t('nav.tagline')}</div>
          </div>
        </NavLink>

        <LayoutGroup>
          <nav className="hidden items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 md:flex" aria-label={t('nav.primaryAria')}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className="relative">
                {({ isActive }) => (
                  <span className="relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-bold">
                    {isActive ? (
                      <motion.span
                        layoutId="navpill"
                        className="absolute inset-0 rounded-xl bg-white/[0.92]"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    ) : null}
                    <l.icon className={cn('relative z-10 h-4 w-4', isActive ? 'text-black' : 'text-white/55')} aria-hidden />
                    <span className={cn('relative z-10', isActive ? 'text-black' : 'text-white/55')}>{t(l.labelKey)}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </LayoutGroup>

        <div className="flex items-center gap-2">
          <button type="button" className="hidden rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white/60 transition hover:bg-white/[0.08] hover:text-white md:inline-flex" aria-label={t('nav.notifications')}>
            <Bell className="h-4 w-4" />
          </button>
          <NavLink
            to="/profile"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/85 transition hover:bg-white/[0.08]"
            title={t('nav.profile')}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500/90 to-indigo-600/80 text-[11px] font-extrabold text-white shadow-float">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-[100px] truncate sm:inline">{user?.name || t('nav.profile')}</span>
          </NavLink>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            aria-label={t('nav.logout')}
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-3 md:hidden" aria-label={t('nav.mobileNavAria')}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              cn(
                'flex min-w-[88px] flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-extrabold tracking-wide transition',
                isActive
                  ? 'border-transparent bg-white/[0.92] text-black shadow-float'
                  : 'border-white/[0.06] bg-[#0a0a0a] text-white/50'
              )
            }
          >
            <l.icon className="h-4 w-4" />
            {t(l.labelKey)}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
