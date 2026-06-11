interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 pb-6 border-b border-border">
      <h1 className="text-xl font-semibold text-text mb-1">{title}</h1>
      <p className="text-muted text-sm">{description}</p>
    </div>
  );
}
