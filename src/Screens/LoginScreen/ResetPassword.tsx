import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CommonStyle from "../../styles/CommonStyle";
import { confirmPasswordReset } from "../../services/_private/PasswordReset/PasswordResetApi";
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "../../utils/passwordPolicy";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      alert("유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    if (!isValidPassword(newPassword)) {
      alert(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmPasswordReset(token, newPassword);
      if (result && result.success === true) {
        alert("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.");
        navigate("/login");
      } else {
        alert(result?.message || "비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있어요.");
      }
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: CommonStyle.colors.background,
      fontFamily: "sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      padding: "50px 40px",
      backgroundColor: CommonStyle.colors.white,
      borderRadius: CommonStyle.Radius.card,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
      textAlign: "center" as const,
    },
    title: {
      fontSize: "28px",
      fontWeight: "900",
      color: CommonStyle.colors.mainNavy,
      marginBottom: "10px",
    },
    subtitle: {
      fontSize: "14px",
      color: CommonStyle.colors.textGray,
      marginBottom: "30px",
    },
    input: {
      width: "100%",
      padding: "16px",
      marginBottom: "12px",
      backgroundColor: CommonStyle.colors.white,
      border: `1px solid ${CommonStyle.colors.border}`,
      borderRadius: CommonStyle.Radius.input,
      color: CommonStyle.colors.mainNavy,
      fontSize: "16px",
      outline: "none",
      boxSizing: "border-box" as const,
    },
    button: {
      width: "100%",
      padding: "16px",
      backgroundColor: CommonStyle.colors.mainNavy,
      color: "white",
      border: "none",
      borderRadius: CommonStyle.Radius.button,
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
    },
    backLink: {
      marginTop: "24px",
      fontSize: "14px",
      color: CommonStyle.colors.textGray,
      cursor: "pointer",
      display: "block",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>새 비밀번호 설정</h1>
        <p style={styles.subtitle}>새로 사용할 비밀번호를 입력해주세요.</p>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />

        <button
          style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>

        <span style={styles.backLink} onClick={() => navigate("/login")}>
          로그인으로 돌아가기
        </span>
      </div>
    </div>
  );
}
