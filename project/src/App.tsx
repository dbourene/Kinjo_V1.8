import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { KinjoLogo } from './screens/KinjoLogo/KinjoLogo';
import { Registration } from './pages/Registration';
import { EmailConfirmation } from './pages/EmailConfirmation';
import { Login } from './pages/Login';
import { ConsumerDashboard } from './pages/ConsumerDashboard';
import { ProducerDashboard } from './pages/ProducerDashboard';
import { ProducerMap } from './pages/maps/ProducerMap';
import { ConsumerMap } from './pages/maps/ConsumerMap';
import { TestPythonAPI } from './pages/TestPythonAPI';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logo" element={<KinjoLogo />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/confirm" element={<EmailConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/consumer-dashboard" element={<ConsumerDashboard />} />
        <Route path="/producer-dashboard" element={<ProducerDashboard />} />
        <Route path="/producer-map" element={<ProducerMap />} />
        <Route path="/consumer-map" element={<ConsumerMap />} />
        <Route path="/test-python" element={<TestPythonAPI />} />
      </Routes>
    </Router>
  );
}