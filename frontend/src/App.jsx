import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Newspage from "./pages/Newspage/Newspage.jsx";
import Stockpage from "./pages/Stockpage/Stockpage.jsx";
import Mutualfundpage from "./pages/Mutualfundpage/Mutualfundpage.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import FundAlloc from "./pages/FundAlloc/FundAlloc.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element ={<Dashboard />} />
        <Route path="/news" element={<Newspage />} />
        <Route path="/stocks" element = {<Stockpage />} />
        <Route path="/mutualfunds" element = {<Mutualfundpage/>}/>
        <Route path="/fundalloc" element = {<FundAlloc/>}/>
        <Route
          path="*"
          element={
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h1>404 — Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;