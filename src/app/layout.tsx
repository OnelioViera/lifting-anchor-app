import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lindsay Precast — Lifting Anchor Calculator",
  description:
    "Select the correct precast lifting anchor, edge distance, and safe working load using the ALP Supply catalog.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
