import type { Metadata } from "next";
import "./globals.css";
import "./refinements.css";
import localFont from "next/font/local";
const displayFont = localFont({
  src: "../../public/fonts/bydt-display.woff",
  display: "swap",
  variable: "--font-display",
  weight: "700",
  fallback: ["Arial"],
});
export const metadata: Metadata = {
  title: "Curio City by BYDT · A little try, a big possibility",
  description:
    "Curio City by BYDT: discover Cape-Abilities, try an offline build, and grow a capability passport. Synthetic-data demonstration.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={displayFont.variable}>{children}</body>
    </html>
  );
}
