import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smaczer",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body className={inter.className}>
          <link
            href="https://styleguide.brainly.com/225.8.0/style-guide.css"
            rel="stylesheet"
          />
          <Script src="https://styleguide.brainly.com/images/icons-f71af3176e.js" />
          <Script src="https://styleguide.brainly.com/images/subjects-icons-b0f96b6e0b.js" />
          <Script src="https://styleguide.brainly.com/images/subjects-mono-icons-0fe77c49f4.js" />
          {children}
        </body>
      </html>
    </SessionWrapper>
  );
}
