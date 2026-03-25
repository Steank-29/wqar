import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Contact from './components/Contact';
import './App.css';

function HomePage() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Oswald, sans-serif', color: '#8C5A3C', marginBottom: '16px' }}>
        Welcome to Wqar
      </h1>
      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', color: '#666' }}>
        Discover your signature scent
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;