import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { Battle } from './pages/Battle';
import { AddFragrance } from './pages/AddFragrance';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Battle />} />
          <Route path="/add-fragrance" element={<AddFragrance />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
