const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  expenses: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  habits: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16.5 8" />
    </>
  ),
  goals: (
    <>
      <path d="M5 10c0-2.2 3.1-4 7-4s7 1.8 7 4v7c0 2.2-3.1 4-7 4s-7-1.8-7-4v-7Z" />
      <path d="M5 10c0 2.2 3.1 4 7 4s7-1.8 7-4M12 3v6M9 6h6" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      <path d="m4 7 6-4 6 6 5-5" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#00BC44" />
      <path
        d="M10 26.5 16.5 20l4 4L30 14.5"
        stroke="#003E14"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 14.5H30V21"
        stroke="#003E14"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Icon;
