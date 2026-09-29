import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CircleAlert, CircleCheck } from "lucide-react";
import { findIdApiCall } from "../../services/_private/FindId/FindIdApi";
import { authStyles as s } from "../../styles/auth";
import AuthBrandPanel from "./AuthBrandPanel";

export default function FindId() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    maskedId?: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!name || !email) {
      alert("이름과 이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await findIdApiCall(name, email);
      if (response && response.success === true && response.data?.membId) {
        setResult({ found: true, maskedId: response.data.membId });
      } else {
        setResult({ found: false });
      }
    } catch (error) {
      alert("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 화면 표시용 상태 (포커스된 입력칸)
  const [focused, setFocused] = useState<string | null>(null);
  const inputStyle = (field: string) => ({ ...s.input, ...(focused === field ? s.inputFocus : {}) });

  return (
    <div style={s.page}>
      <AuthBrandPanel />

      <main style={s.formSide}>
        <div style={s.formBox}>
          <button type="button" style={s.backLink} onClick={() => navigate("/login")}>
            <ArrowLeft size={16} />
            로그인으로
          </button>
          <h1 style={s.title}>아이디 찾기</h1>

          {result ? (
            <>
              <p style={s.subtitle}>입력하신 정보로 조회한 결과입니다.</p>
              {result.found ? (
                <div style={s.resultBox}>
                  <div style={{ ...s.resultIcon, background: "#dcfce7", color: "#16a34a" }}>
                    <CircleCheck size={26} />
                  </div>
                  <div style={s.resultTitle}>회원님의 아이디입니다</div>
                  <div style={s.resultValue}>{result.maskedId}</div>
                  <p style={s.resultText}>개인정보 보호를 위해 아이디 일부는 가려서 보여드립니다.</p>
                </div>
              ) : (
                <div style={s.resultBox}>
                  <div style={{ ...s.resultIcon, background: "#fef3c7", color: "#b45309" }}>
                    <CircleAlert size={26} />
                  </div>
                  <div style={s.resultTitle}>일치하는 회원 정보가 없습니다</div>
                  <p style={s.resultText}>이름과 이메일을 다시 확인해주세요.</p>
                </div>
              )}

              <div style={s.buttonStack}>
                <button type="button" style={s.submit} onClick={() => navigate("/login")}>
                  로그인하기
                </button>
                {result.found ? (
                  <button type="button" style={s.secondaryButton} onClick={() => navigate("/forgot-password")}>
                    비밀번호 재설정
                  </button>
                ) : (
                  <button type="button" style={s.secondaryButton} onClick={() => setResult(null)}>
                    다시 찾기
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p style={s.subtitle}>가입 시 입력한 이름과 이메일을 입력해주세요.</p>
              {/* form으로 감싸서 Enter로도 제출 */}
              <form
                style={s.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <label style={s.field}>
                  <span style={s.label}>이름</span>
                  <input
                    type="text"
                    placeholder="홍길동"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("name")}
                  />
                </label>
                <label style={s.field}>
                  <span style={s.label}>이메일</span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("email")}
                  />
                </label>
                <button
                  type="submit"
                  style={{ ...s.submit, ...(loading ? s.submitDisabled : {}) }}
                  disabled={loading}
                >
                  {loading ? "확인 중..." : "아이디 찾기"}
                </button>
              </form>
            </>
          )}

          {/* 결과 화면에는 같은 버튼이 이미 있어서 입력 화면에서만 */}
          {!result && (
            <div style={s.signupRow}>
              비밀번호를 잊으셨나요?
              <button type="button" style={s.signupLink} onClick={() => navigate("/forgot-password")}>
                비밀번호 재설정
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
