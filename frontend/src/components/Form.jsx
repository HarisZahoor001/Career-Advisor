import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
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

  // Common auth fields
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

  // Handle field blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
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
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
      default:
        break;
    }

    // If field has been touched, validate it
    if (touched[field]) {
      const error = validateField(field, value);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
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
    
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
    
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
        age: age ? parseInt(age) : null,
        education_level: education || "",
        field_of_study: studyField || "",
        cgpa: cgpa ? parseFloat(cgpa) : null,
        skills: skills ? skills.split(",").map(s => s.trim()).filter(s => s).join(",") : "",
        interests: interests ? interests.split(",").map(i => i.trim()).filter(i => i).join(",") : "",
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
        if (typeof data === 'object' && data !== null) {
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

  // Check if form has errors
  const hasErrors = () => {
    if (isLogin) {
      return !!errors.username || !!errors.password || !!errors.general;
    } else {
      return !!errors.username || !!errors.password || !!errors.email || 
             !!errors.fullName || !!errors.age || !!errors.cgpa || !!errors.general;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-black border border-gray-800 p-6 rounded-xl"
      >
        <h1 className="text-white text-2xl mb-6 text-center">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        {/* General Error */}
        {errors.general && (
          <p className="text-red-400 text-sm mb-3 text-center">
            {errors.general}
          </p>
        )}

        {/* Username */}
        <div className="mb-3">
          <input
            className={`w-full p-3 bg-gray-900 text-white border rounded ${
              getFieldError('username') ? 'border-red-500' : 'border-gray-700'
            }`}
            type="text"
            placeholder="Username"
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
        <div className="mb-3">
          <input
            className={`w-full p-3 bg-gray-900 text-white border rounded ${
              getFieldError('password') ? 'border-red-500' : 'border-gray-700'
            }`}
            type="password"
            placeholder="Password"
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

        {/* Signup fields only */}
        {!isLogin && (
          <>
            {/* Full Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <input
                  className={`w-full p-3 bg-gray-900 text-white border rounded ${
                    getFieldError('fullName') ? 'border-red-500' : 'border-gray-700'
                  }`}
                  type="text"
                  placeholder="Full Name"
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
                  className={`w-full p-3 bg-gray-900 text-white border rounded ${
                    getFieldError('email') ? 'border-red-500' : 'border-gray-700'
                  }`}
                  type="email"
                  placeholder="Email"
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

            {/* Age & CGPA Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <input
                  className={`w-full p-3 bg-gray-900 text-white border rounded ${
                    getFieldError('age') ? 'border-red-500' : 'border-gray-700'
                  }`}
                  type="number"
                  placeholder="Age"
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
                  className={`w-full p-3 bg-gray-900 text-white border rounded ${
                    getFieldError('cgpa') ? 'border-red-500' : 'border-gray-700'
                  }`}
                  type="number"
                  step="0.01"
                  placeholder="CGPA (0-4.0)"
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

            {/* Education Level */}
            <div className="mb-3">
              <input
                className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded"
                type="text"
                placeholder="Education Level (e.g., Bachelor's, Master's)"
                value={education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Field of Study */}
            <div className="mb-3">
              <input
                className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded"
                type="text"
                placeholder="Field of Study"
                value={studyField}
                onChange={(e) => handleInputChange('studyField', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Skills */}
            <div className="mb-3">
              <input
                className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded"
                type="text"
                placeholder="Skills (comma-separated, e.g., Python, React, Communication)"
                value={skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Interests */}
            <div className="mb-3">
              <input
                className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded"
                type="text"
                placeholder="Interests (comma-separated, e.g., AI, Web Dev, Data Science)"
                value={interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* Forgot Password Link (Login only) */}
        {isLogin && (
          <div className="text-right mb-3">
            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
              Forgot Password?
            </Link>
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-3">
            <LoadingIndicator />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || hasErrors()}
          className="w-full btn text-black font-semibold p-3 sm:p-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : (isLogin ? "Login" : "Create Account")}
        </button>

        <p className="text-gray-400 text-sm mt-4 text-center">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <Link className="text-blue-400 hover:text-blue-300" to="/signup">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link className="text-blue-400 hover:text-blue-300" to="/login">
                Login
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
