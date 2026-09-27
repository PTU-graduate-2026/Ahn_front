import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CircleAlert, Eye, EyeOff } from "lucide-react";
import { confirmPasswordReset } from "../../services/_private/PasswordReset/PasswordResetApi";
import {
  getPasswordChecks,
  isValidPassword,
  PASSWORD_POLICY_MESSAGE,
} from "../../utils/passwordPolicy";
import { authStyles as s } from "../../styles/auth";
import AuthBrandPanel from "./AuthBrandPanel";

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

  // 화면 표시용 상태 (포커스된 입력칸, 비밀번호 보기)
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordChecks = getPasswordChecks(newPassword);
  const isConfirmTyped = confirmPassword.length > 0;
  const isPasswordMatch = newPassword === confirmPassword;

  return (
    <div style={s.page}>
      <AuthBrandPanel />

      <main style={s.formSide}>
        <div style={s.formBox}>
          <button type="button" style={s.backLink} onClick={() => navigate("/login")}>
            <ArrowLeft size={16} />
            로그인으로
          </button>
          <h1 style={s.title}>새 비밀번호 설정</h1>

          {!token ? (
            // 메일 링크 없이 들어온 경우 — 입력해도 실패하니 처음부터 안내
            <>
              <p style={s.subtitle}>재설정 링크를 확인할 수 없습니다.</p>
              <div style={s.resultBox}>
                <div style={{ ...s.resultIcon, background: "#fef3c7", color: "#b45309" }}>
                  <CircleAlert size={26} />
                </div>
                <div style={s.resultTitle}>유효하지 않은 링크입니다</div>
                <p style={s.resultText}>
                  메일로 받은 링크를 통해 들어와주세요.
                  <br />
                  링크가 만료되었다면 재설정 메일을 다시 요청해주세요.
                </p>
              </div>
              <div style={s.buttonStack}>
                <button type="button" style={s.submit} onClick={() => navigate("/forgot-password")}>
                  재설정 메일 다시 요청
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={s.subtitle}>새로 사용할 비밀번호를 입력해주세요.</p>
              {/* form으로 감싸서 Enter로도 제출 */}
              <form
                style={s.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <label style={s.field}>
                  <span style={s.label}>새 비밀번호</span>
                  <div style={s.inputWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="영문과 숫자를 포함해 8자 이상"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocused("new")}
                      onBlur={() => setFocused(null)}
                      style={{ ...s.input, paddingRight: 44, ...(focused === "new" ? s.inputFocus : {}) }}
                    />
                    <button
                      type="button"
                      style={s.eyeButton}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* 조건을 만족할 때마다 초록색으로 */}
                  <ul style={s.checkList} aria-label="비밀번호 조건">
                    {passwordChecks.map((check) => (
                      <li key={check.label} style={{ ...s.checkItem, ...(check.ok ? s.hintOk : {}) }}>
                        <Check size={13} strokeWidth={3} />
                        {check.label}
                      </li>
                    ))}
                  </ul>
                </label>

                <label style={s.field}>
                  <span style={s.label}>새 비밀번호 확인</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused("confirm")}
                    onBlur={() => setFocused(null)}
                    style={{ ...s.input, ...(focused === "confirm" ? s.inputFocus : {}) }}
                  />
                  {isConfirmTyped && (
                    <span style={{ ...s.hint, ...(isPasswordMatch ? s.hintOk : s.hintError) }}>
                      {isPasswordMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                    </span>
                  )}
                </label>

                <button
                  type="submit"
                  style={{ ...s.submit, ...(loading ? s.submitDisabled : {}) }}
                  disabled={loading}
                >
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
