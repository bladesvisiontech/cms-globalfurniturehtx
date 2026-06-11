import Sidebar from '@/components/Sidebar';
import PreviewFrame from '@/components/PreviewFrame';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* Editor panel */}
      <main className="w-[480px] shrink-0 overflow-y-auto border-r border-border">
        <div className="px-6 py-8">
          {children}
        </div>
      </main>
      {/* Live preview panel */}
      <PreviewFrame />
    </div>
  );
}
