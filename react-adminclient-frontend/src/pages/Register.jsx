import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth"; // API riêng bạn tạo

export default function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPass) {
      setError("Mật khẩu không khớp!");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser(fullname, email, password); // gọi API register
      if (res.code === 200) {
        navigate("/login");
      } else {
        setError(res.message);
      }
    } catch {
      setError("Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // === CSS nhúng trực tiếp ===
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
      <form style={styles.card} onSubmit={handleRegister}>
        <h2 style={styles.heading}>Đăng ký</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="text"
          placeholder="Họ và tên"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          required
        />

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

        <input
          style={styles.input}
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
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
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        <p style={{ textAlign: "center", marginTop: 15 }}>
          Bạn đã có tài khoản?{" "}
          <span span style={{ color: "#336BFA", cursor: "pointer", fontWeight: "bold" }}
                  onClick={() => navigate("/login")}
            >Đăng nhập
          </span>
        </p>
      </form>
    </div>
  );
}