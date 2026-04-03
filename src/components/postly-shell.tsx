import Link from "next/link";

import { appName, primaryNavigation } from "@/lib/postly-data";

type PostlyShellProps = {
  activePath: string;
  title: string;
  description: string;
  eyebrow: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function PostlyShell({
  activePath,
  title,
  description,
  eyebrow,
  actions,
  children,
}: PostlyShellProps) {
  return (
    <main className="page-wrap">
      <div className="page-grid">
        <header className="hero-card">
          <div className="hero-top">
            <div>
              <p className="eyebrow">{appName}</p>
              <h1 className="page-title">{title}</h1>
              <p className="page-copy">{description}</p>
            </div>
            <div className="hero-actions">{actions}</div>
          </div>

          <div className="hero-strip">
            <span className="badge badge-accent">{eyebrow}</span>
            <span className="badge">Бүх UI Монгол хэлээр</span>
            <span className="badge">Mobile-first интерфэйс</span>
          </div>
        </header>

        <nav className="nav-strip" aria-label="Үндсэн навигаци">
          {primaryNavigation.map((item) => {
            const active = activePath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-chip nav-chip-active" : "nav-chip"}
              >
                <span>{item.label}</span>
                <small>{item.description}</small>
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </main>
  );
}
