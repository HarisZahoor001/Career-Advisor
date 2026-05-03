import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import { validateField } from "../utils/validation";

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

  // Map backend field names → frontend
  const mapBackendField = (key) => {
    const mapping = {
      full_name: "fullName",
      field_of_study: "studyField",
    };
    return mapping[key] || key;
  };

  // Handle blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const valueMap = {
      username,
      password,
      email,
      fullName,
      age,
      cgpa,
      studyField,
      education,
    };

    const error = validateField(field, valueMap[field]);

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

  // Handle input change
  const handleInputChange = (field, value) => {
    const setters = {
      username: setUsername,
      password: setPassword,
      email: setEmail,
      fullName: setFullName,
      age: setAge,
      education: setEducation,
      studyField: setStudyField,
      cgpa: setCgpa,
      skills: setSkills,
      interests: setInterests,
    };

    setters[field]?.(value);

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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    const fields = isLogin
      ? ["username", "password"]
      : ["username", "password", "email", "fullName", "age", "cgpa"];

    const valueMap = {
      username,
      password,
      email,
      fullName,
      age,
      cgpa,
    };

    fields.forEach((field) => {
      const error = validateField(field, valueMap[field]);
      if (error) newErrors[field] = error;
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFields = isLogin
      ? ["username", "password"]
      : ["username", "password", "email", "fullName", "age", "cgpa"];

    setTouched(Object.fromEntries(allFields.map((f) => [f, true])));

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
        skills: (skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(","),
        interests: (interests || "")
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
          .join(","),
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

        if (typeof data === "object") {
          const fieldErrors = {};

          Object.keys(data).forEach((key) => {
            const mappedKey = mapBackendField(key);
            const error = data[key];

            fieldErrors[mappedKey] = Array.isArray(error)
              ? error[0]
              : error;
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
          }

          const firstError = Object.values(data)[0];
          errorMessage = Array.isArray(firstError)
            ? firstError[0]
            : firstError;
        } else {
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

  const getFieldError = (field) =>
    touched[field] && errors[field] ? errors[field] : "";

  return (
    <div className="bg-black flex justify-center items-center min-h-screen w-full px-4 py-8">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-xl bg-black border border-gray-800"
        >
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? "Login" : "Create Account"}
          </h1>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              handleInputChange("username", e.target.value)
            }
            onBlur={() => handleBlur("username")}
            className="w-full p-3 mb-2 bg-gray-900 text-white border border-gray-700 rounded"
          />
          {getFieldError("username") && (
            <p className="text-red-400 text-sm">
              {getFieldError("username")}
            </p>
          )}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              handleInputChange("password", e.target.value)
            }
            onBlur={() => handleBlur("password")}
            className="w-full p-3 mb-2 bg-gray-900 text-white border border-gray-700 rounded"
          />
          {getFieldError("password") && (
            <p className="text-red-400 text-sm">
              {getFieldError("password")}
            </p>
          )}

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) =>
                  handleInputChange("fullName", e.target.value)
                }
                onBlur={() => handleBlur("fullName")}
                className="w-full p-3 mb-2 bg-gray-900 text-white border border-gray-700 rounded"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  handleInputChange("email", e.target.value)
                }
                onBlur={() => handleBlur("email")}
                className="w-full p-3 mb-2 bg-gray-900 text-white border border-gray-700 rounded"
              />
            </>
          )}

          {loading && <LoadingIndicator />}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black p-3 rounded mt-4"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Signup"}
          </button>

          <div className="text-center mt-4 text-gray-400">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-400">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400">
                  Login
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
