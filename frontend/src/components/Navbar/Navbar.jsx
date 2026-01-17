import { Link } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">StockYogi</Link>
      </div>

      <div className="nav-right">
        <Link to="/">Dashboard</Link>
        <Link to="/stocks">Stocks</Link>
        <Link to="/mutualfunds">Mutual Funds</Link>
        <Link to="/news">News</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/fundalloc">FundAlloc</Link>
        <Link to="/ai">AI Assistant</Link>
      </div>
    </nav>
  );
}
