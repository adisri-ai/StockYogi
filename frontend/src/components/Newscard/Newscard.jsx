import "./Newcard.css";

export default function NewsCard({ title, subtitle }) {
  return (
    <div className="news-card">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
  );
}
