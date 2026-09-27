import React, { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 이동할수 있게 해주는 hook
import { signUpApiCall } from "../../services/_private/SignUp/SignUpApi";
import {
  getPasswordChecks,
  isValidPassword,
  PASSWORD_POLICY_MESSAGE,
} from "../../utils/passwordPolicy";
import { authStyles as s } from "../../styles/auth";
import AuthBrandPanel from "./AuthBrandPanel";

export default function SignUp() {
  const navigate = useNavigate();
  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    name: "",
    email: "",
    confirmPassword: "", // handleSignUp에서 password와 일치하는지 검사
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault(); // form 제출 시 페이지 새로고침 방지
    // 간단한 유효성 검사
    // formData거 가져다 쓴다
    const { id, password, name, email, confirmPassword } = formData;

    if (!id || !password || !name || !email) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    // 구글 로그인 계정(아이디 = 이메일)과 겹치지 않도록 아이디에 '@'는 쓸 수 없다
    if (id.length < 4 || /[@\s]/.test(id)) {
      alert("아이디는 공백과 '@' 없이 4자 이상으로 입력해주세요.");
      return;
    }

    if (!isValidPassword(password)) {
      alert(PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const result = await signUpApiCall({ id, password, name, email });
      console.log("백엔드 응답:", result);
      if (result && result.success === true) {
        alert("회원가입이 완료되었습니다! 로그인 해주세요.");
        navigate("/login"); // 성공 시 로그인 페이지로 이동
      } else {
        alert(result.message || "회원가입 실패");
      }
    } catch (error) {
      alert("예기치 못한 오류가 발생했습니다.");
    }
  };

  // 화면 표시용 상태 (포커스된 입력칸, 비밀번호 보기, 버튼 hover)
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitHover, setIsSubmitHover] = useState(false);

  // 입력하는 동안 바로 보여주는 안내 (제출 시 검사는 handleSignUp에서 그대로)
  const passwordChecks = getPasswordChecks(formData.password);
  const isIdTyped = formData.id.length > 0;
  const isIdValid = formData.id.length >= 4 && !/[@\s]/.test(formData.id);
  const isConfirmTyped = formData.confirmPassword.length > 0;
  const isPasswordMatch = formData.password === formData.confirmPassword;

  const inputStyle = (name: string, extra: React.CSSProperties = {}) => ({
    ...s.input,
    ...extra,
    ...(focused === name ? s.inputFocus : {}),
  });

  const focusProps = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  return (
    <div style={s.page}>
      {/* 왼쪽: 브랜드 패널 */}
      <AuthBrandPanel />

      {/* 오른쪽: 회원가입 폼 */}
      <main style={s.formSide}>
        <div style={{ ...s.formBox, maxWidth: 420 }}>
          <h1 style={s.title}>회원가입</h1>
          <p style={s.subtitle}>ZCS 서비스 이용을 위해 정보를 입력해주세요.</p>

          <form onSubmit={handleSignUp} style={s.form}>
            <div style={s.fieldRow}>
              <label style={s.field}>
                <span style={s.label}>이름</span>
                <input
                  name="name"
                  placeholder="홍길동"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle("name")}
                  {...focusProps("name")}
                />
              </label>

              <label style={s.field}>
                <span style={s.label}>아이디</span>
                <input
                  name="id"
                  placeholder="4자 이상"
                  autoComplete="username"
                  value={formData.id}
                  onChange={handleChange}
                  style={inputStyle("id")}
                  {...focusProps("id")}
                />
              </label>
            </div>
            <span
              style={{
                ...s.hint,
                marginTop: -10,
                ...(isIdTyped ? (isIdValid ? s.hintOk : s.hintError) : {}),
              }}
            >
              아이디는 공백과 '@' 없이 4자 이상 입력해주세요.
            </span>

            <label style={s.field}>
              <span style={s.label}>이메일</span>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle("email")}
                {...focusProps("email")}
              />
            </label>

            <label style={s.field}>
              <span style={s.label}>비밀번호</span>
              <div style={s.inputWrap}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="영문과 숫자를 포함해 8자 이상"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  style={inputStyle("password", { paddingRight: 44 })}
                  {...focusProps("password")}
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
              <span style={s.label}>비밀번호 확인</span>
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 한 번 더 입력하세요"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={inputStyle("confirmPassword")}
                {...focusProps("confirmPassword")}
              />
              {isConfirmTyped && (
                <span style={{ ...s.hint, ...(isPasswordMatch ? s.hintOk : s.hintError) }}>
                  {isPasswordMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                </span>
              )}
            </label>

            <button
              type="submit"
              style={{ ...s.submit, ...(isSubmitHover ? s.submitHover : {}) }}
              onMouseEnter={() => setIsSubmitHover(true)}
              onMouseLeave={() => setIsSubmitHover(false)}
            >
              가입하기
            </button>
          </form>

          <div style={s.signupRow}>
            이미 계정이 있으신가요?
            <button type="button" style={s.signupLink} onClick={() => navigate("/login")}>
              로그인
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
