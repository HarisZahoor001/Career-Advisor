import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatbotUI from "./components/ChatbotUI";
import Jobs from "./components/Jobs";
import About from "./pages/About";
import Contact from "./components/Contact";
import Form from "./components/Form";
import ForgotPassword from "./components/ForgotPassword";
import ChangePassword from "./components/ChangePassword";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<ProtectedRoute><ChatbotUI /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact isPage={true} /></ProtectedRoute>} />
        <Route path="/login" element={<Form route="/api/auth/login/" method="login" />} />
        <Route path="/signup" element={<Form route="/api/auth/register/" method="signup" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
