type DashboardMetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
};

export function DashboardMetricCard({
  label,
  value,
  helper,
}: DashboardMetricCardProps) {
  return (
    <article className="dashboard-metric-card">
      <p className="eyebrow">{label}</p>
      <p className="dashboard-metric-value">{value}</p>
      <p className="muted-text">{helper}</p>
    </article>
  );
}
