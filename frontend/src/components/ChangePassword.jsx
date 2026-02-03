import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "./LoadingIndicator";
import { validatePassword } from "../utils/validation";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    
    if (!oldPassword) newErrors.oldPassword = "Current password is required";
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    setMessage("");
    
    try {
      const response = await api.post("/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      
      setMessage("Password changed successfully!");
      
      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Show success message for 3 seconds
      setTimeout(() => {
        navigate("/profile"); // Redirect to profile or dashboard
      }, 3000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      "Failed to change password";
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear field error when user types
    const newErrors = { ...errors };
    delete newErrors[field];
    delete newErrors.general;
    setErrors(newErrors);
    
    switch (field) {
      case 'oldPassword':
        setOldPassword(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        const passwordError = validatePassword(value);
        if (passwordError) {
          setErrors({ ...newErrors, newPassword: passwordError });
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        if (value && newPassword && value !== newPassword) {
          setErrors({ ...newErrors, confirmPassword: "Passwords do not match" });
        }
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-black/80 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
        
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-900/30 border border-green-500 text-green-400 text-sm">
            {message}
          </div>
        )}
        
        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500 text-red-400 text-sm">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className={`w-full p-3 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                errors.oldPassword ? 'border-red-500' : 'border-gray-700'
              }`}
              value={oldPassword}
              onChange={(e) => handleInputChange('oldPassword', e.target.value)}
              disabled={loading}
            />
            {errors.oldPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.oldPassword}</p>
            )}
          </div>
          
          <div>
            <label className="text-gray-300 text-sm mb-2 block">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className={`w-full p-3 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                errors.newPassword ? 'border-red-500' : 'border-gray-700'
              }`}
              value={newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              disabled={loading}
            />
            {errors.newPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>
          
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className={`w-full p-3 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
              }`}
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full btn text-black font-semibold p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <LoadingIndicator /> : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;