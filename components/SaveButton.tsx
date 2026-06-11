'use client';

interface SaveButtonProps {
  saving: boolean;
  onClick: () => void;
}

export default function SaveButton({ saving, onClick }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {saving ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Publishing...
        </>
      ) : (
        'Save & Publish'
      )}
    </button>
  );
}
