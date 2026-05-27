// Root layout passthrough. Locale layout in app/[locale]/layout.tsx owns html/body.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
