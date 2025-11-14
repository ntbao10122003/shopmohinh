import React, { useState } from "react";
import { loginUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    navigate("/home"); 
    {/*e.preventDefault();
    setError("");

    try {
      const res = await loginUser(email, password);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/home"); 
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại!");
    }*/}
  }

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f2f5fa",
      padding: "10px",
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      padding: "30px",
      borderRadius: "15px",
      background: "white",
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
    },
    heading: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#336BFA",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      fontSize: "14px",
      outline: "none",
    },
    error: {
      color: "red",
      textAlign: "center",
      marginBottom: "10px",
    },
    button: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: 600,
      color: "white",
      border: "none",
      cursor: "pointer",
      background: "linear-gradient(135deg, #4f8cff, #336bfa)",
      boxShadow: "0 4px 12px rgba(51,107,250,0.4)",
      transition: "0.25s ease",
    },
    buttonDisabled: {
      background: "#ccc",
      cursor: "not-allowed",
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleLogin}>
  <h2 style={styles.heading}>Đăng nhập</h2>
  {error && <p style={styles.error}>{error}</p>}

  <input
    style={styles.input}
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />

  <input
    style={styles.input}
    type="password"
    placeholder="Mật khẩu"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <button
    type="submit"
    style={{
      ...styles.button,
      ...(loading ? styles.buttonDisabled : {}),
    }}
    disabled={loading}
  >
    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
  </button>
  <p style={{ textAlign: "center", marginTop: 15 }}>
    Chưa có tài khoản?{" "}
    <span
      style={{ color: "#336BFA", cursor: "pointer", fontWeight: "bold" }}
      onClick={() => navigate("/register")}
    >
      Đăng ký
    </span>
  </p>
</form>
    </div>
  );
}

export default Login;