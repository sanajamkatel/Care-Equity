import type { Metadata } from "next";
import { Reem_Kufi } from "next/font/google";
import "./globals.css";
import ToasterComponent from "./components/Toaster";

const reemKufi = Reem_Kufi({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin", "arabic"],
  variable: "--font-reem-kufi",
});

export const metadata: Metadata = {
  title: "Care Equity",
  description: "Addressing inequities in maternal healthcare by empowering patients with data-driven insights. Report experiences, find safer hospitals, and help create equitable healthcare.",
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={reemKufi.variable}>
      <body
        className={`${reemKufi.className} antialiased`}
        style={{ fontFamily: reemKufi.style.fontFamily }}
      >
        {children}
        <ToasterComponent />
      </body>
    </html>
  );
}
