import Link from "next/link";

import { logoutAction } from "@/app/dashboard/auth-actions";

type DashboardShellProps = {
  activePath: string;
  hospitalName: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const navigation = [
  {
    href: "/dashboard",
    label: "Хянах самбар",
    description: "Ерөнхий үзүүлэлт",
  },
  {
    href: "/dashboard/doctors",
    label: "Эмч нар",
    description: "Эмч ба avatar",
  },
  {
    href: "/dashboard/topics",
    label: "Сэдвүүд",
    description: "Дараагийн шат",
  },
  {
    href: "/dashboard/settings",
    label: "Тохиргоо",
    description: "Брэнд ба холбоо",
  },
] as const;

function isActivePath(activePath: string, href: string) {
  if (href === "/dashboard") {
    return activePath === href;
  }

  return activePath === href || activePath.startsWith(`${href}/`);
}

export function DashboardShell({
  activePath,
  hospitalName,
  title,
  description,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand-card">
          <p className="dashboard-brand-label">Эмнэлгийн AI систем</p>
          <h1 className="dashboard-brand-name">{hospitalName}</h1>
          <p className="dashboard-brand-copy">
            Контент үүсгэх суурь удирдлагын хэсэг
          </p>
        </div>

        <nav className="dashboard-nav" aria-label="Үндсэн навигаци">
          {navigation.map((item) => {
            const active = isActivePath(activePath, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "dashboard-nav-link dashboard-nav-link-active"
                    : "dashboard-nav-link"
                }
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="dashboard-sidebar-footer">
          <button type="submit" className="button-ghost button-block">
            Гарах
          </button>
        </form>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header-card">
          <div className="stack-sm">
            <p className="eyebrow">Эмнэлгийн контентын удирдлага</p>
            <h2 className="dashboard-page-title">{title}</h2>
            <p className="dashboard-page-copy">{description}</p>
          </div>
          {actions ? <div className="dashboard-toolbar">{actions}</div> : null}
        </header>

        <div className="dashboard-content">{children}</div>
      </section>
    </main>
  );
}
