type SectionCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="section-card">
      <div className="section-head">
        <p className="eyebrow">{title}</p>
        <p className="section-copy">{description}</p>
      </div>
      {children}
    </section>
  );
}
