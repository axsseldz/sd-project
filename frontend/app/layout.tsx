import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevOps Task Simulator",
  description:
    "AI-powered middleware that translates natural language into executable DevOps scripts and commands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-700 selection:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
