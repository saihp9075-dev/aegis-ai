import hiLocale from './locales/hi.json';
import knLocale from './locales/kn.json';
import zhLocale from './locales/zh.json';
import jaLocale from './locales/ja.json';
import taLocale from './locales/ta.json';
import teLocale from './locales/te.json';
import mrLocale from './locales/mr.json';

/** UI copy per language code (unknown keys fall back to English). */
export type I18nKey = string;

const en: Record<string, string> = {
  'nav.home': 'Home',
  'nav.sos': 'SOS',
  'nav.hospitals': 'Hospitals',
  'nav.medicines': 'Medicines',
  'nav.history': 'History',
  'nav.settings': 'Settings',
  'nav.profile': 'Profile',
  'settings.control': 'CONTROL',
  'settings.preferencesKicker': 'PREFERENCES',
  'settings.title': 'Settings',
  'settings.sub': 'Accessibility, alerts, and localization.',
  'settings.sectionLanguage': 'LANGUAGE',
  'settings.sectionDisplay': 'DISPLAY & ACCESSIBILITY',
  'settings.sectionRecipients': 'ALERT RECIPIENTS',
  'settings.sectionLegal': 'LEGAL & SUPPORT',
  'settings.language': 'Language',
  'settings.languageDesc': 'Choose your preferred language.',
  'settings.darkMode': 'Dark mode',
  'settings.darkModeDesc': 'Always on for AEGIS (you can still preview light shell).',
  'settings.largeText': 'Large text',
  'settings.largeTextDesc': 'Increase base typography size.',
  'settings.telegramChatDesc': 'Your personal chat id with the bot.',
  'settings.telegramGroupDesc': 'Optional group chat for alerts.',
  'settings.alertEmailDesc': 'Critical alerts sent to this email.',
  'settings.telegramHelp': 'Tip: message your bot and read chat_id from getUpdates, or use @userinfobot.',
  'settings.saveRecipients': 'Save alert recipients',
  'settings.experience': 'Experience toggles',
  'settings.alerts': 'Alert settings',
  'settings.telegramChat': 'Telegram chat ID',
  'settings.telegramGroup': 'Telegram group ID',
  'settings.alertEmail': 'Notification email',
  'settings.save': 'Save settings',
  'settings.saving': 'Saving…',
  'settings.saved': 'Saved',
  'settings.saveError': 'Could not save. Check connection and try again.',
  'settings.privacy': 'Privacy Policy',
  'settings.terms': 'Terms & Conditions',
  'settings.help': 'Help & Support',
  'settings.footer': 'Built with love by Sharad',
  'lang.en': 'English',
  'lang.hi': 'Hindi',
  'lang.kn': 'Kannada',
  'lang.zh': 'Chinese (Mandarin)',
  'lang.ja': 'Japanese',
  'lang.ta': 'Tamil',
  'lang.te': 'Telugu',
  'lang.mr': 'Marathi',

  'home.command': 'COMMAND',
  'home.welcome': 'Welcome back, {name}',
  'home.subtitle': 'Emergency profile is live. Keep GPS enabled for faster routing and hospital ranking.',
  'home.medicalIdentity': 'Medical identity',
  'home.bloodGroup': 'Blood group',
  'home.allergies': 'Allergies',
  'home.conditions': 'Conditions',
  'home.notes': 'Notes',
  'home.noneListed': 'None listed',
  'home.qr': 'QR',
  'home.liveLocation': 'Live location preview',
  'home.acquiringGps': 'Acquiring satellites…',
  'home.quickEmergencies': 'Quick emergencies',
  'home.nearbyTitle': 'Nearby hospitals preview',
  'home.nearbyBefore': 'Open the',
  'home.nearbyAfter': 'module for live OSM ranking, directions, and distance sorting.',
  'home.nearbyLink': 'Hospitals',
  'home.protocolsTitle': 'Protocols',
  'home.protocolsIntro': 'Short reminders for common emergencies. This is not a diagnosis — call emergency services when in doubt.',
  'home.protocolsCtaOpen': 'Open',
  'home.protocolsCtaSuffix': 'for CPR cycles, countdown, and voice-guided steps.',
  'home.protocolsFirstAid': 'First aid',
  'home.openTopic': 'Open steps',

  'protocol.chest.title': 'Chest pain / possible cardiac',
  'protocol.chest.body':
    'Sit the person down, loosen tight clothing, and call emergency services. If trained and advised, be ready to start CPR. Chew aspirin only if directed by a clinician — not everyone should take it.',
  'protocol.stroke.title': 'Stroke (FAST)',
  'protocol.stroke.body':
    'Face drooping, arm weakness, or speech trouble are red flags. Note the time symptoms started and call emergency services immediately. Do not give food or drink.',
  'protocol.burns.title': 'Burns',
  'protocol.burns.body':
    'Cool running water on the burn for 20 minutes (superficial burns). Remove jewelry near the area. Cover loosely with a clean non-fluffy cloth. Do not pop blisters.',
  'protocol.bleed.title': 'Heavy bleeding',
  'protocol.bleed.body':
    'Apply firm direct pressure with a clean pad. Raise the limb if practical. If bleeding is severe or spurting, call emergency services and keep pressure on.',
  'protocol.seizure.title': 'Seizure',
  'protocol.seizure.body':
    'Protect from injury — cushion the head, clear nearby hazards, loosen tight clothing. Time the event. Do not put anything in the mouth. Call emergency services if it lasts more than 5 minutes or repeats.',
  'protocol.breathing.title': 'Breathing difficulty',
  'protocol.breathing.body':
    'Help them sit upright, loosen tight clothing, and stay calm. If wheezing, follow their personal asthma plan if available. Call emergency services for severe shortness of breath, blue lips, or confusion.',
  'protocol.fever.title': 'High fever',
  'protocol.fever.body':
    'Encourage fluids and rest. Use antipyretics only per label or clinician advice. Seek care for infants, stiff neck, rash, confusion, or breathing problems.',
  'protocol.choking.title': 'Choking (responsive adult)',
  'protocol.choking.body':
    'Encourage coughing if effective. If not, give 5 back blows then 5 abdominal thrusts (Heimlich) for adults. Call emergency services if obstruction persists.',

  'home.quick.chest': 'Chest pain',
  'home.quick.stroke': 'Stroke',
  'home.quick.burns': 'Burns',
  'home.quick.bleed': 'Heavy bleeding',
  'home.quick.seizure': 'Seizure',
  'home.quick.fever': 'Fever',
  'home.quick.breath': 'Breathing issue',
  'home.quick.statePrefix': 'Emergency quick card: ',

  'sos.kicker': 'SOS CONTROL CENTER',
  'sos.title': 'One tap. All hands on deck.',
  'sos.sub':
    'This is your panic button. AEGIS dispatches Telegram + Email with your medical profile and live GPS.',
  'sos.dispatch': 'Dispatch SOS',
  'sos.button': 'SOS',
  'sos.hint': 'Press the button. AEGIS will keep notifying if delivery fails. You can configure recipients in Settings.',
  'sos.configure': 'Configure Telegram & Email →',
  'sos.optionalNote': 'Optional note',
  'sos.placeholder': 'What happened?',
  'sos.liveLocation': 'LIVE LOCATION',
  'sos.waitingGps': 'Waiting for GPS…',
  'sos.delivery': 'DELIVERY STATUS',
  'sos.dispatching': 'Dispatching alerts…',
  'sos.deliveryLine': 'Telegram: {tg} · Email: {em}',
  'sos.dispatchFailed':
    'Could not reach the server (offline, timeout, or error). Keep the backend running on port 8787, then tap SOS again.',
  'sos.channelHelp':
    'If Telegram or Email shows failed: open Settings and set recipients. For Gmail use an App Password in the API .env as EMAIL_PASS (spaces are stripped automatically). SOS is still logged when you see statuses above.',
  'sos.noneYet': 'No SOS dispatched yet in this session.',
  'sos.directions': 'Directions',

  'hospitals.kicker': 'GEOINT',
  'hospitals.title': 'Nearby care, ranked by distance',
  'hospitals.error': 'Using offline emergency guidance: hospitals could not be fetched. Retry.',
  'hospitals.lockingGps': 'Locking GPS…',
  'hospitals.refreshGps': 'Refresh location',
  'hospitals.empty': 'No hospitals found within range. Try refreshing GPS or open Directions on the map.',

  'meds.kicker': 'HEALTH SCHEDULER',
  'meds.sub': 'AUTOMATED MEDICATION VIGILANCE',
  'meds.title': 'Medicine reminders',
  'meds.testTelegram': 'TEST TELEGRAM',
  'meds.testOk': 'Telegram test sent',
  'meds.testFail': 'Telegram test failed',
  'meds.dose': 'Dose',
  'meds.dosePlaceholder': 'e.g. 500MG',
  'meds.everyday': 'EVERYDAY',
  'meds.activeVigilance': 'ACTIVE VIGILANCE',
  'meds.inactive': 'PAUSED',
  'meds.delete': 'Delete reminder',
  'meds.addTitle': 'Add medicine',
  'meds.name': 'Name',
  'meds.placeholder': 'e.g. Aspirin',
  'meds.reminderTime': 'Reminder time',
  'meds.saveReminder': 'Save reminder',
  'meds.telegramOn': 'on',
  'meds.telegramOff': 'off',
  'meds.telegram': 'Telegram:',
  'meds.active': 'Active',
  'meds.footerDashboard': 'Dashboard',
  'meds.footerReminders': 'REMINDERS',
  'meds.addShortcut': 'Add reminder shortcut',

  'history.kicker': 'EMERGENCY TIMELINE',
  'history.title': 'Your incident history',
  'history.sub': 'Every triage, alert, and dispatch is logged for clinician review.',
  'history.incidentId': 'ID',
  'history.telegram': 'Telegram:',
  'history.email': 'Email:',
  'history.empty': 'No incidents yet. Run an AI triage from the Risk console.',

  'profile.kicker': 'IDENTITY',
  'profile.title': 'Profile',
  'profile.operator': 'Operator',
  'profile.bloodGroup': 'Blood group',
  'profile.dob': 'Date of birth',
  'profile.allergies': 'Allergies (comma separated)',
  'profile.medications': 'Medications (comma separated)',
  'profile.conditions': 'Conditions (comma separated)',
  'profile.notes': 'Notes',
  'profile.save': 'Save profile',
  'profile.edit': 'Edit',

  'risk.kicker': 'NEURAL TRIAGE',
  'risk.title': 'Risk console',
  'risk.sub': 'Describe symptoms. AEGIS runs a multi-agent LLM pipeline and returns a strict JSON envelope.',
  'risk.input': 'Input',
  'risk.placeholder': 'e.g. crushing chest pain radiating to arm…',
  'risk.analyze': 'Analyze',
  'risk.analyzing': 'Analyzing…',
  'risk.offline': 'Could not reach AEGIS. Check that the backend is running on port 8787.',
  'risk.offlineDetail': 'Using offline emergency guidance because live AI could not run.',
  'risk.escalation': 'Escalation:',
  'risk.active': 'ACTIVE',
  'risk.standby': 'STANDBY',
  'risk.why': 'Why this risk',
  'risk.summary': 'AI summary',
  'risk.firstAid': 'First aid / immediate guidance',
  'risk.action': 'Recommended action',

  'firstAid.kicker': 'FIELD PROTOCOL',
  'firstAid.title': 'First aid',
  'firstAid.sub': 'Voice narration, step progress, CPR timer, and emergency countdown.',
  'firstAid.countdownTitle': 'Emergency countdown',
  'firstAid.countdownStart': 'Start 3-2-1',
  'firstAid.cprTitle': 'CPR timer (2 minutes)',
  'firstAid.cprStart': 'Start CPR cycle',
  'firstAid.stepsTitle': 'Immediate steps',
  'firstAid.back': 'Back',
  'firstAid.next': 'Next',
  'firstAid.repeatVoice': 'Repeat voice',
  'firstAid.idle': 'Idle',
  'firstAid.go': 'Go',

  'firstAid.steps.d0': 'Ensure scene safety',
  'firstAid.steps.d1': 'Call emergency services',
  'firstAid.steps.d2': 'Stay with the patient',
  'firstAid.steps.d3': 'Loosen tight clothing',
  'firstAid.steps.d4': 'Monitor breathing',

  'firstAid.steps.c0': 'Start chest compressions',
  'firstAid.steps.c1': 'Push hard and fast (100–120/min)',
  'firstAid.steps.c2': 'Allow full recoil',
  'firstAid.steps.c3': 'Switch every 2 minutes if trained',

  'firstAid.steps.st0': 'Call emergency services — time is critical',
  'firstAid.steps.st1': 'Note when symptoms began',
  'firstAid.steps.st2': 'Keep airway clear; do not give food or drink',
  'firstAid.steps.st3': 'Stay with them until help arrives',

  'firstAid.steps.bu0': 'Cool with running water up to 20 minutes',
  'firstAid.steps.bu1': 'Remove tight items near the burn',
  'firstAid.steps.bu2': 'Cover loosely with a clean cloth',
  'firstAid.steps.bu3': 'Seek care for large or deep burns',

  'firstAid.steps.bl0': 'Apply firm direct pressure',
  'firstAid.steps.bl1': 'Raise the limb if no fracture suspected',
  'firstAid.steps.bl2': 'Add layers if blood soaks through — do not remove first pad',
  'firstAid.steps.bl3': 'Call emergency services for severe bleeding',

  'firstAid.steps.sz0': 'Protect from injury — cushion head, clear hazards',
  'firstAid.steps.sz1': 'Time the seizure; loosen tight clothing',
  'firstAid.steps.sz2': 'Do not restrain or put anything in the mouth',
  'firstAid.steps.sz3': 'Call emergency services if >5 minutes or repeats',

  'firstAid.steps.br0': 'Sit upright, loosen tight clothing, stay calm',
  'firstAid.steps.br1': 'Follow personal asthma plan if available',
  'firstAid.steps.br2': 'Call emergency services for severe distress or blue lips',
  'firstAid.steps.br3': 'Monitor until help arrives',

  'firstAid.steps.fv0': 'Encourage fluids and rest',
  'firstAid.steps.fv1': 'Use antipyretics only per label or clinician advice',
  'firstAid.steps.fv2': 'Seek urgent care for red-flag symptoms',

  'firstAid.steps.ch0': 'Encourage effective coughing',
  'firstAid.steps.ch1': 'Give 5 firm back blows between shoulder blades',
  'firstAid.steps.ch2': 'Then 5 abdominal thrusts if trained (adults)',
  'firstAid.steps.ch3': 'Call emergency services if obstruction persists',

  'firstAid.voice.go': 'Go.',
  'firstAid.voice.cycle': 'Cycle complete. Swap compressor if available.',

  'floating.open': 'Open AEGIS assistant',
  'floating.title': 'AEGIS · Copilot',
  'floating.close': 'Close assistant',
  'floating.hint': 'Ask symptoms, medications, or emergencies. Voice supported.',
  'floating.thinking': 'Thinking…',
  'floating.placeholder': 'Type a message…',
  'floating.voice': 'Voice input',
  'floating.send': 'Send',
  'floating.offline':
    'Using offline emergency guidance. If urgent, call emergency services.',
  'floating.apiUnreachable':
    'Could not reach the AEGIS API. Start the backend (port 8787) or set VITE_API_URL to your server root including /api, e.g. http://localhost:8787/api/',
  'floating.sessionExpired': 'Your session expired. Sign out and sign in again.',
  'floating.chatFailed': 'Request failed: {detail}',

  'floatSos.dispatching': 'Dispatching…',
  'floatSos.failed': 'Failed — open SOS page to retry',
  'floatSos.timeout': 'Timed out — check backend & email/SMTP, then retry',
  'floatSos.aria': 'Emergency SOS',

  'nav.brand': 'AEGIS AI',
  'nav.tagline': 'HEALTHCARE OS',
  'nav.notifications': 'Notifications',
  'nav.logout': 'Log out',
  'nav.primaryAria': 'Primary navigation',
  'nav.mobileNavAria': 'Mobile primary navigation',

  'hospitals.osm': 'OSM',

  'login.language': 'Language',
  'login.brandLine': 'AEGIS.AI',
  'login.brandTagline': 'HEALTHCARE OS',
  'login.heroTitle': "Your AI guardian for life's",
  'login.heroHighlight': 'critical moments.',
  'login.heroSub':
    'Real-time AI triage. One-tap SOS to Telegram & Email. Live hospital finder. Doctor-ready PDF reports. Built for the moments that matter.',
  'login.featureSosTitle': 'Live SOS alerts',
  'login.featureSosDesc': 'Dispatch encrypted context, GPS, and profile to your response team.',
  'login.featureTriageTitle': 'AI risk triage',
  'login.featureTriageDesc': 'Multi-agent analysis with strict JSON safety envelopes.',
  'login.welcomeTitle': 'Welcome back',
  'login.welcomeSub': 'Sign in to access your emergency tools',
  'login.googleError': 'Google sign-in:',
  'login.continueGoogle': 'Continue with Google',
  'login.or': 'OR',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.emailPlaceholder': 'you@example.com',
  'login.passwordPlaceholder': 'Password (min 6 chars)',
  'login.signIn': 'Sign In →',
  'login.createAccount': 'Create account',
  'login.newTo': 'New to AEGIS?',
  'login.createOne': 'Create one',
  'login.haveAccount': 'Already have an account?',
  'login.signInLink': 'Sign in',
  'login.passwordMin': 'Use at least 6 characters',
  'login.emailInvalid': 'Enter a valid email',
  'login.failed': 'Sign-in failed. Check your email and password.',
  'login.apiDown': 'Cannot reach AEGIS API. Start the backend (npm run dev from project root) on port 8787.',

  'auth.securing': 'Securing your session…',
  'auth.redirecting': 'Redirecting…',
  'auth.googleLine': 'AEGIS · Google sign-in',

  'protected.booting': 'Booting AEGIS…',
};

function mergeDict(base: Record<string, string>, patch: Record<string, string>) {
  return { ...base, ...patch };
}

export const DICTS: Record<string, Record<string, string>> = {
  en,
  hi: mergeDict(en, hiLocale as Record<string, string>),
  kn: mergeDict(en, knLocale as Record<string, string>),
  zh: mergeDict(en, zhLocale as Record<string, string>),
  ja: mergeDict(en, jaLocale as Record<string, string>),
  ta: mergeDict(en, taLocale as Record<string, string>),
  te: mergeDict(en, teLocale as Record<string, string>),
  mr: mergeDict(en, mrLocale as Record<string, string>),
};

export function translate(lang: string, key: string, vars?: Record<string, string | number>): string {
  const pack = DICTS[lang] || DICTS.en;
  let s = pack[key] ?? DICTS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}
