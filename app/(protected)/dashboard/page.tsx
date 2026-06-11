import Link from 'next/link';
import { getSession } from '@/lib/auth';

const SECTIONS = [
  { href: '/site',         label: 'Site Info',    description: 'Contact, hours, address and social links', icon: '◎' },
  { href: '/banners',      label: 'Banners',      description: 'Hero slider images and calls to action', icon: '▣' },
  { href: '/categories',   label: 'Categories',   description: 'Product categories shown on the homepage', icon: '◈' },
  { href: '/products',     label: 'Products',     description: 'Full product catalog — prices, images, stock', icon: '◉' },
  { href: '/testimonials', label: 'Testimonials', description: 'Customer reviews shown on the site', icon: '★' },
  { href: '/faq',          label: 'FAQ',          description: 'Frequently asked questions', icon: '?' },
  { href: '/blog',         label: 'Blog',         description: 'Blog posts and articles', icon: '✎' },
];

export default async function DashboardPage() {
  const session = await getSession();
  return (
    <div>
      <div className="mb-8 pb-6 border-b border-border">
        <h1 className="text-xl font-semibold text-text mb-1">Dashboard</h1>
        <p className="text-muted text-sm">Welcome back, {session?.email}. What would you like to update today?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-colors group">
            <div className="flex items-start gap-4">
              <span className="text-2xl text-muted group-hover:text-accent transition-colors mt-0.5">{s.icon}</span>
              <div>
                <div className="font-medium text-text mb-1">{s.label}</div>
                <div className="text-muted text-sm leading-relaxed">{s.description}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 p-4 bg-card border border-border rounded-lg">
        <p className="text-muted text-xs">Changes are published automatically. After saving, your website will update in approximately 30–60 seconds.</p>
      </div>
    </div>
  );
}
