import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-minimal">
      <section className="landing-card">
        <div className="stack-sm">
          <p className="eyebrow">Эмнэлгийн AI систем</p>
          <h1 className="landing-title">Нэвтрэх</h1>
          <p className="landing-copy">
            Систем рүү орохын тулд нэвтрэх эсвэл шинээр бүртгүүлнэ үү.
          </p>
        </div>

        <div className="landing-actions">
          <Link href="/auth" className="button-primary button-block">
            Нэвтрэх
          </Link>
          <Link href="/auth#register-form" className="button-secondary button-block">
            Бүртгүүлэх
          </Link>
        </div>
      </section>
    </main>
  );
}
