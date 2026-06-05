const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconTable = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M9 5v14" /></svg>
)
export const IconPlus = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconSpark = (p) => (
  <svg {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>
)
export const IconUser = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" /></svg>
)
export const IconEye = (p) => (
  <svg {...base} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="2.6" /></svg>
)
export const IconBot = (p) => (
  <svg {...base} {...p}><rect x="4" y="7" width="16" height="12" rx="3" /><circle cx="9" cy="13" r="1.2" /><circle cx="15" cy="13" r="1.2" /><path d="M12 3v4" /><path d="M9 3h6" /></svg>
)
export const IconSend = (p) => (
  <svg {...base} {...p}><path d="M3 11.5 21 4l-7.5 18-2.5-8-8-2.5z" /></svg>
)
export const IconChat = (p) => (
  <svg {...base} {...p}><path d="M4 6h16v10H8l-4 4z" /></svg>
)
export const IconCampaign = (p) => (
  /* Podium: 3 blocks (2nd, 1st tallest, 3rd) with a star on top of the 1st */
  <svg {...base} {...p}>
    <rect x="3"  y="14" width="6" height="7" />
    <rect x="9"  y="9"  width="6" height="12" />
    <rect x="15" y="16" width="6" height="5" />
    <path d="M12 3 13 6 16 6 13.5 8 14.5 11 12 9 9.5 11 10.5 8 8 6 11 6z" />
  </svg>
)
export const IconVolumeOn = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M16 8a5 5 0 0 1 0 8" />
    <path d="M19 5a9 9 0 0 1 0 14" />
  </svg>
)
export const IconVolumeOff = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M16 9l5 6M21 9l-5 6" />
  </svg>
)
