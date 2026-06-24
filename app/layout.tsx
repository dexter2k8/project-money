import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";
import { Slide, ToastContainer } from "react-toastify";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Money",
  description: "Dashboard for your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-hidden">
        {children}
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          transition={Slide}
          hideProgressBar
        />
      </body>
    </html>
  );
}
