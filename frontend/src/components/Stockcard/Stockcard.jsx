import "./stockcard.css";

export default function StockCard({ symbol, price }) {
  return (
    <div className="stock-card">
      <h3>{symbol}</h3>
      <p className="price">₹ {price}</p>
    </div>
  );
}
