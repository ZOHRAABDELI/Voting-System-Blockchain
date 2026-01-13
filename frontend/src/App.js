import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Web3Provider } from './Web3Context';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Elections from './components/Elections';
import ElectionDetail from './components/ElectionDetail';
import CreateElection from './components/CreateElection';
import Blockchain from './components/Blockchain';
import './index.css';

function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/elections" element={<Elections />} />
              <Route path="/elections/:id" element={<ElectionDetail />} />
              <Route path="/create-election" element={<CreateElection />} />
              <Route path="/blockchain" element={<Blockchain />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;
