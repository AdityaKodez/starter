import { ThemeProvider } from "@/components/providers/theme-provider";
import { WarningDialogProvider } from "@/components/providers/warning-dialog-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const noto = DM_Sans({ subsets: ["latin"], variable: "--font-heading" });

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revind",
  description: "Turn any YouTube playlist into a structured course.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full ",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        dmSans.variable,
        noto.variable,
      )}
    >
      <body className="min-h-full  flex flex-col">
        <ThemeProvider>
          <WarningDialogProvider>
            <TooltipProvider>
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </TooltipProvider>
          </WarningDialogProvider>
          <Toaster position="top-right" closeButton />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
