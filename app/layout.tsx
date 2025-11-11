export const metadata = {
  title: "AI Sales Scout — Melexis",
  description: "Find likely adopters of Melexis parts and the people to contact",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}