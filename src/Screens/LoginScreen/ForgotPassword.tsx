import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { requestPasswordReset } from "../../services/_private/PasswordReset/PasswordResetApi";
import { authStyles as s } from "../../styles/auth";
import AuthBrandPanel from "./AuthBrandPanel";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      // 보안상 가입 여부와 무관하게 항상 동일한 안내를 보여줌
      setSubmitted(true);
    } catch (error) {
      alert("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 화면 표시용 상태 (입력칸 포커스)
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={s.page}>
      <AuthBrandPanel />

      <main style={s.formSide}>
        <div style={s.formBox}>
          <button type="button" style={s.backLink} onClick={() => navigate("/login")}>
            <ArrowLeft size={16} />
            로그인으로
          </button>
          <h1 style={s.title}>비밀번호 재설정</h1>

          {submitted ? (
            <>
              <p style={s.subtitle}>메일함을 확인해주세요.</p>
              <div style={s.resultBox}>
                <div style={{ ...s.resultIcon, background: "rgba(31, 78, 140, 0.1)", color: "#1f4e8c" }}>
                  <MailCheck size={26} />
                </div>
                <div style={s.resultTitle}>재설정 링크를 보냈습니다</div>
                <p style={s.resultText}>
                  <strong style={{ color: "#0f172a" }}>{email}</strong>
                  <br />
                  위 주소로 가입된 계정이 있다면 비밀번호 재설정 메일이 도착합니다.
                  <br />
                  메일이 보이지 않으면 스팸 메일함도 확인해주세요.
                </p>
              </div>

              <div style={s.buttonStack}>
                <button type="button" style={s.submit} onClick={() => navigate("/login")}>
                  로그인으로 돌아가기
                </button>
                <button type="button" style={s.secondaryButton} onClick={() => setSubmitted(false)}>
                  다른 이메일로 다시 보내기
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={s.subtitle}>가입하신 이메일 주소를 입력하시면 재설정 링크를 보내드려요.</p>
              {/* form으로 감싸서 Enter로도 제출 */}
              <form
                style={s.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <label style={s.field}>
                  <span style={s.label}>이메일</span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{ ...s.input, ...(isFocused ? s.inputFocus : {}) }}
                  />
                </label>
                <button
                  type="submit"
                  style={{ ...s.submit, ...(loading ? s.submitDisabled : {}) }}
                  disabled={loading}
                >
                  {loading ? "전송 중..." : "재설정 링크 보내기"}
                </button>
              </form>
            </>
          )}

          <div style={s.signupRow}>
            아이디가 기억나지 않나요?
            <button type="button" style={s.signupLink} onClick={() => navigate("/find-id")}>
              아이디 찾기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
