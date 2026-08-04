import { Sidebar } from "@/components/layout/Sidebar";
import { WebTour } from "@/components/shared/WebTour";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1" data-tour="grading-workspace">
          {children}
        </main>
      </div>
      <WebTour />
    </div>
  );
}
