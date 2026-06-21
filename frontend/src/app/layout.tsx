import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'ThreatDesk - SOC Management Platform',
  description: 'Web-based SOC management platform for alert collection, triage, and escalation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
