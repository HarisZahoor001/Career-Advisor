import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";

export default function Form({ route, method }) {
  const navigate = useNavigate();
  const isLogin = method === "login";

  // auth fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // signup fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let body = {
        username,
        password,
      };

      if (!isLogin) {
        body = {
          username,
          password,
          email,
          full_name: fullName,
        };
      }

      const res = await api.post(route, body);

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-black border border-gray-800 p-6 rounded-xl"
      >
        <h1 className="text-white text-2xl mb-6 text-center">
          {isLogin ? "Login" : "Signup"}
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {/* Username */}
        <input
          className="w-full p-3 mb-3 bg-gray-900 text-white border border-gray-700 rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Password */}
        <input
          className="w-full p-3 mb-3 bg-gray-900 text-white border border-gray-700 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Signup fields only */}
        {!isLogin && (
          <>
            <input
              className="w-full p-3 mb-3 bg-gray-900 text-white border border-gray-700 rounded"
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              className="w-full p-3 mb-3 bg-gray-900 text-white border border-gray-700 rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}

        {loading && <LoadingIndicator />}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black p-3 rounded mt-2"
        >
          {loading ? "Loading..." : isLogin ? "Login" : "Signup"}
        </button>

        <p className="text-gray-400 text-sm mt-4 text-center">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <Link className="text-blue-400" to="/signup">
                Signup
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link className="text-blue-400" to="/login">
                Login
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
