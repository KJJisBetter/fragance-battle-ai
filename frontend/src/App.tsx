import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Battle } from '@/pages/Battle';
import { Login } from '@/components/Login';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Battle />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
