import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopNav } from '@/components/nav/TopNav';
import { FloatingSOS } from '@/components/floating/FloatingSOS';
import { FloatingChat } from '@/components/floating/FloatingChat';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="aegis-app-shell min-h-full bg-grid-fade">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <FloatingChat />
      <FloatingSOS />
    </div>
  );
}
