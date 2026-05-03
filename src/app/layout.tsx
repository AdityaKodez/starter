import { WarningDialogProvider } from "@/components/providers/warning-dialog-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";
import type { Metadata } from "next";
import { Figtree, Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
const noto = DM_Sans({ subsets: ["latin"], variable: "--font-heading" });

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

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
        "h-full light",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
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
      </body>
    </html>
  );
}
