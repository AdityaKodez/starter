import { WarningDialogProvider } from "@/components/providers/warning-dialog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";
import type { Metadata } from "next";
import { DM_Sans, Figtree, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const figtreeHeading = Figtree({subsets:['latin'],variable:'--font-heading'});

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
  title: "Corusa",
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
      className={cn(
        "h-full dark",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        dmSans.variable,
        figtreeHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <WarningDialogProvider>
          <TooltipProvider>
            <TRPCReactProvider>
              {children}
            </TRPCReactProvider>
          </TooltipProvider>
        </WarningDialogProvider>
        <Toaster position="top-right" closeButton theme="dark" />
      </body>
    </html>
  );
}
