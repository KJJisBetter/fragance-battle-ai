import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Battle } from '@/pages/Battle';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Battle />} />
          <Route path="/battle" element={<Battle />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
