export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-[#f7f7f5]">{children}</div>;
}
