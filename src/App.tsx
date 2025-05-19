import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPatient from './pages/LoginPatient.tsx';
import LoginDoctor from './pages/LoginDoctor.tsx';
import LoginReceptionist from './pages/LoginReceptionist.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login/paciente" element={<LoginPatient />} />
        <Route path="/login/medico" element={<LoginDoctor />} />
        <Route path="/login/recepcionista" element={<LoginReceptionist />} />
        {/* ...outras rotas... */}
      </Routes>
    </Router>
  );
}

export default App;