import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import { Link } from "react-router-dom";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validateAge,
  validateCGPA,
  validateField,
} from "../utils/validation";

export default function Form({ route, method }) {
  const navigate = useNavigate();
  const isLogin = method === "login";

  // Common fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Signup-only fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [studyField, setStudyField] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle field blur (when user leaves a field)
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    let value, error;
    switch (field) {
      case 'username':
        value = username;
        error = validateUsername(value);
        break;
      case 'password':
        value = password;
        error = validatePassword(value);
        break;
      case 'email':
        value = email;
        error = validateEmail(value);
        break;
      case 'fullName':
        value = fullName;
        error = validateFullName(value);
        break;
      case 'age':
        value = age;
        error = validateAge(value);
        break;
      case 'cgpa':
        value = cgpa;
        error = validateCGPA(value);
        break;
      default:
        return;
    }
    
    if (error) {
      setErrors({ ...errors, [field]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Handle input change with validation
  const handleInputChange = (field, value) => {
    // Update the field value
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'fullName':
        setFullName(value);
        break;
      case 'age':
        setAge(value);
        break;
      case 'education':
        setEducation(value);
        break;
      case 'studyField':
        setStudyField(value);
        break;
      case 'cgpa':
        setCgpa(value);
        break;
      case 'skills':
        setSkills(value);
        break;
      case 'interests':
        setInterests(value);
        break;
    }

    // If field has been touched, validate it
    if (touched[field]) {
      const error = validateField(field, value);
      if (error) {
        setErrors({ ...errors, [field]: error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Common validations for both login and signup
    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    // Signup-specific validations
    if (!isLogin) {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;

      const fullNameError = validateFullName(fullName);
      if (fullNameError) newErrors.fullName = fullNameError;

      const ageError = validateAge(age);
      if (ageError) newErrors.age = ageError;

      const cgpaError = validateCGPA(cgpa);
      if (cgpaError) newErrors.cgpa = cgpaError;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = isLogin 
      ? ['username', 'password']
      : ['username', 'password', 'email', 'fullName', 'age', 'cgpa'];
    
    setTouched(Object.fromEntries(allFields.map(field => [field, true])));
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    let body = { username, password };

    if (!isLogin) {
      body = {
        username,
        password,
        full_name: fullName,
        age: age || null,
        education_level: education || "",
        field_of_study: studyField || "",
        cgpa: cgpa || null,
        skills: skills.split(",").map(s => s.trim()).filter(s => s).join(","),
        interests: interests.split(",").map(i => i.trim()).filter(i => i).join(","),
        email,
      };
    }

    try {
      const res = await api.post(route, body);

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      let errorMessage = "An error occurred. Please try again.";
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          // Handle field-specific errors
          const fieldErrors = {};
          Object.keys(data).forEach(key => {
            const error = data[key];
            if (Array.isArray(error)) {
              fieldErrors[key] = error[0];
            } else if (typeof error === 'string') {
              fieldErrors[key] = error;
            }
          });
          
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
          }
          
          // Handle non-field errors
          const firstError = Object.values(data)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Get field error message
  const getFieldError = (field) => {
    return touched[field] && errors[field] ? errors[field] : "";
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

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left side - Welcome/Info Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {isLogin ? "Welcome Back!" : "Start Your Career Journey"}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl">
              {isLogin 
                ? "Sign in to access personalized career recommendations and AI guidance."
                : "Create an account to get personalized career advice based on your skills and interests."}
            </p>
          </div>
          
          {/* Features/Benefits */}
          <div className="hidden lg:block mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">AI-powered career recommendations</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">Personalized skill development plans</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">Real-time industry insights</span>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2">
          <form
            onSubmit={handleSubmit}
            className="relative z-10 p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg flex flex-col items-center w-full bg-black/80 backdrop-blur-lg border border-gray-800"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              {isLogin ? "Login" : "Create Account"}
            </h1>

            {/* General Error */}
            {errors.general && (
              <div className="w-full mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500 text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            <div className="w-full space-y-4">
              {/* Username */}
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                    getFieldError('username') ? 'border-red-500' : 'border-gray-700'
                  }`}
                  value={username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  required
                  disabled={loading}
                />
                {getFieldError('username') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('username')}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                    getFieldError('password') ? 'border-red-500' : 'border-gray-700'
                  }`}
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  required
                  disabled={loading}
                />
                {getFieldError('password') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('password')}</p>
                )}
              </div>

              {/* SIGNUP FIELDS (Only visible in Signup mode) */}
              {!isLogin && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                          getFieldError('fullName') ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        onBlur={() => handleBlur('fullName')}
                        required
                        disabled={loading}
                      />
                      {getFieldError('fullName') && (
                        <p className="text-red-400 text-sm mt-1">{getFieldError('fullName')}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                          getFieldError('email') ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        required
                        disabled={loading}
                      />
                      {getFieldError('email') && (
                        <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Age"
                        className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                          getFieldError('age') ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        onBlur={() => handleBlur('age')}
                        disabled={loading}
                      />
                      {getFieldError('age') && (
                        <p className="text-red-400 text-sm mt-1">{getFieldError('age')}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="CGPA (0-4.0)"
                        className={`w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${
                          getFieldError('cgpa') ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={cgpa}
                        onChange={(e) => handleInputChange('cgpa', e.target.value)}
                        onBlur={() => handleBlur('cgpa')}
                        disabled={loading}
                      />
                      {getFieldError('cgpa') && (
                        <p className="text-red-400 text-sm mt-1">{getFieldError('cgpa')}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Education Level (e.g., Bachelor's, Master's)"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Field of Study"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={studyField}
                      onChange={(e) => handleInputChange('studyField', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Skills (comma-separated, e.g., Python, React, Communication)"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Interests (comma-separated, e.g., AI, Web Dev, Data Science)"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={interests}
                      onChange={(e) => handleInputChange('interests', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Forgot Password Link (Login only) */}
              {isLogin && (
                <div className="text-right">
                  <Link 
                    to="/forgot-password" 
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

              {loading && (
                <div className="flex justify-center">
                  <LoadingIndicator />
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full btn text-black font-semibold p-3 sm:p-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? "Processing..." : (isLogin ? "Login" : "Create Account")}
              </button>

              {/* Link to toggle between Login/Signup */}
              <div className="text-center mt-4">
                {isLogin ? (
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Sign up here
                    </Link>
                  </p>
                ) : (
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Login here
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}