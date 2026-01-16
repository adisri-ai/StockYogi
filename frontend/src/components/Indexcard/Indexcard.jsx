import "./IndexCard.css";

export default function IndexCard({ name, price, source }) {
  return (
    <div className="index-card">
      <h2>{name}</h2>
      <p className="index-price">{price}</p>
      <span className="index-source">Source: {source}</span>
    </div>
  );
}
