
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Store",
  description: "E-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}