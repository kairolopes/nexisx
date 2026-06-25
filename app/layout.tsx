import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "NexisX — Neurodesenvolvimento, triagem inteligente e ambientes sensoriais",
    template: "%s · NexisX",
  },
  description:
    "O NexisX une triagem inteligente, análise facial, M-CHAT, genética, salas sensoriais e acompanhamento para apoiar famílias, profissionais e instituições.",
  keywords: [
    "neurodesenvolvimento",
    "triagem",
    "M-CHAT",
    "salas sensoriais",
    "TEA",
    "genética",
    "exoma",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
