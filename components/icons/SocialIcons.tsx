import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
    </svg>
  );
}

export function TikTokIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.74-.22-.22-.4-.47-.58-.73v6.56c0 1.25-.26 2.5-.83 3.61-.71 1.4-1.92 2.53-3.41 3.12-1.49.61-3.18.73-4.73.34-1.55-.38-2.98-1.32-3.95-2.61-1.04-1.39-1.54-3.18-1.39-4.92.13-1.63.85-3.21 2.05-4.32 1.25-1.16 2.93-1.84 4.63-1.89.17 0 .34 0 .5.01v4.07c-.96.09-1.93.53-2.58 1.27-.69.78-.99 1.87-.82 2.89.16 1 .83 1.9 1.74 2.33.91.43 1.99.38 2.84-.16.85-.54 1.39-1.49 1.43-2.5.01-.13.01-.26.01-.39V0h.03z" />
    </svg>
  );
}
