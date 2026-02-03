import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import LoadingIndicator from "./LoadingIndicator";
import { validateEmail, validatePassword } from "../utils/validation";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request, 2: Verify, 3: Reset
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!token.trim()) newErrors.token = "Verification code is required";
    else if (token.length !== 6) newErrors.token = "Code must be 6 digits";
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = {};
    const passwordError = validatePassword(newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  // Handle email submission for reset code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const response = await api.post("/auth/forgot-password/", { email });
      setMessage(response.data.detail || "Reset code sent to your email!");
      setStep(2);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      "Failed to send reset code. Please try again.";
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Verify the reset token
  const handleVerifyToken = async (e) => {
    e.preventDefault();
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/auth/verify-reset-token/", {
        email,
        token,
      });
      setMessage(response.data.detail || "Code verified successfully!");
      setStep(3);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      "Invalid verification code";
      setErrors({ token: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Reset password with new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const validationErrors = validateStep3();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/auth/reset-password/", {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(response.data.detail || "Password reset successfully! Redirecting to login...");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      "Failed to reset password. Please try again.";
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const response = await api.post("/auth/forgot-password/", { email });
      setMessage("New code sent to your email!");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      "Failed to resend code. Please try again.";
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes with validation
  const handleInputChange = (field, value, validationFn = null) => {
    // Clear specific field error
    const newErrors = { ...errors };
    delete newErrors[field];
    delete newErrors.general;
    setErrors(newErrors);

    // Update field value
    switch (field) {
      case 'email':
        setEmail(value);
        if (validationFn) setErrors({ ...newErrors, email: validationFn(value) });
        break;
      case 'token':
        // Only allow numbers and limit to 6 digits
        const numbersOnly = value.replace(/\D/g, '').slice(0, 6);
        setToken(numbersOnly);
        break;
      case 'newPassword':
        setNewPassword(value);
        if (validationFn) setErrors({ ...newErrors, newPassword: validationFn(value) });
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        if (value && newPassword && value !== newPassword) {
          setErrors({ ...newErrors, confirmPassword: "Passwords do not match" });
        } else {
          delete newErrors.confirmPassword;
          setErrors(newErrors);
        }
        break;
    }
  };

  return (
    <div className="bg-black flex justify-center items-center min-h-screen w-full relative px-4 sm:px-6 lg:px-8 py-8">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
            repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
          `,
          backgroundSize: "100px 100px",
          opacity: 0.1,
        }}
      />

      <div className="w-full max-w-md mx-auto">
        <div className="relative z-10 p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col items-center w-full bg-black/80 backdrop-blur-lg border border-gray-800">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center w-full mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step >= stepNum
                      ? "bg-blue-500 border-blue-500"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <span className={`font-semibold ${
                    step >= stepNum ? "text-white" : "text-gray-400"
                  }`}>
                    {stepNum}
                  </span>
                </div>
                <span className="text-xs mt-2 text-gray-400">
                  {stepNum === 1 ? "Request" : stepNum === 2 ? "Verify" : "Reset"}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-700 -z-10">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-400 text-sm mb-6 text-center">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new password for your account"}
          </p>

          {/* Error Message */}
          {errors.general && (
            <div className="w-full mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="w-full mb-4 p-3 rounded-lg bg-green-900/30 border border-green-500 text-green-400 text-sm">
              {message}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="w-full space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  }`}
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value, validateEmail)}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full btn text-black font-semibold p-3 sm:p-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingIndicator />
                    <span className="ml-2">Sending...</span>
                  </div>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyToken} className="w-full space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 text-sm">Verification Code</label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all text-center text-2xl tracking-widest ${
                    errors.token ? "border-red-500" : "border-gray-700"
                  }`}
                  value={token}
                  onChange={(e) => handleInputChange('token', e.target.value)}
                  maxLength={6}
                  disabled={loading}
                />
                {errors.token && (
                  <p className="text-red-400 text-sm mt-1">{errors.token}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  Check your email at <span className="text-blue-300">{email}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrors({});
                    setMessage("");
                  }}
                  className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 btn text-black font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  disabled={loading || token.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="w-full space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                    errors.newPassword ? "border-red-500" : "border-gray-700"
                  }`}
                  value={newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value, validatePassword)}
                  disabled={loading}
                />
                {errors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  Password must contain:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li className={newPassword.length >= 8 ? "text-green-400" : ""}>• At least 8 characters</li>
                    <li className={/(?=.*[a-z])/.test(newPassword) ? "text-green-400" : ""}>• One lowercase letter</li>
                    <li className={/(?=.*[A-Z])/.test(newPassword) ? "text-green-400" : ""}>• One uppercase letter</li>
                    <li className={/(?=.*\d)/.test(newPassword) ? "text-green-400" : ""}>• One number</li>
                    <li className={/(?=.*[!@#$%^&*])/.test(newPassword) ? "text-green-400" : ""}>• One special character</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-700"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-green-400 text-sm mt-1">✓ Passwords match</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setErrors({});
                  }}
                  className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 btn text-black font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-800 w-full text-center">
            <p className="text-gray-400">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;