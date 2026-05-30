import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Walk-in Registration | CS Coworking Spaces",
  description: "Register your visit at CS Coworking Spaces.",
};

export default function WalkinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-cs-black flex flex-col ${inter.className}`}>
      {children}
    </div>
  );
}
