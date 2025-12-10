import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatbotUI from "./components/ChatbotUI";

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
      </Routes>
    </Router>
  );
}
