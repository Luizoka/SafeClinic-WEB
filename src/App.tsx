import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPatient from './pages/LoginPatient.tsx';
import LoginDoctor from './pages/LoginDoctor.tsx';
import LoginReceptionist from './pages/LoginReceptionist.tsx';
import RegisterPatient from './pages/RegisterPatient.tsx';
import RegisterDoctor from './pages/RegisterDoctor.tsx';
import RegisterReceptionist from './pages/RegisterReceptionist.tsx';
import ReceptionistDashboard from './pages/ReceptionistDashboard.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login/paciente" element={<LoginPatient />} />
        <Route path="/login/medico" element={<LoginDoctor />} />
        <Route path="/login/recepcionista" element={<LoginReceptionist />} />
        <Route path="/registro/paciente" element={<RegisterPatient />} />
        <Route path="/registro/medico" element={<RegisterDoctor />} />
        <Route path="/registro/recepcionista" element={<RegisterReceptionist />} />
        <Route path="/painel/recepcionista" element={<ReceptionistDashboard />} />
        {/* ...outras rotas... */}
      </Routes>
    </Router>
  );
}

export default App;