export default function StatCard({ title, value, subtitle, icon: Icon, tone = "emerald" }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-icon">{Icon ? <Icon size={21} /> : null}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </div>
    </article>
  );
}
