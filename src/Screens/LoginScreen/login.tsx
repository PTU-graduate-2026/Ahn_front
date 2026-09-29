import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authStyles as s } from "../../styles/auth";
import AuthBrandPanel from "./AuthBrandPanel";
import { loginApiCall } from "../../services/_private/Login/LoginApi";
import { googleLoginApiCall } from "../../services/_private/Auth/GoogleAuthApi";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, setCurrentUser } from "../../utils/currentUser";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigation("/dashboard");
    }
  }, [navigation]);

  // 로그인 응답이 오면 membSeq/membNm을 저장하고 대시보드로 이동
  const completeLogin = (data: any) => {
    if (data?.membSeq) {
      setCurrentUser(data.membSeq, data.membNm);
      navigation("/dashboard");
      return true;
    }
    return false;
  };

  // 구글 로그인 콜백: GSI가 credential(ID 토큰)을 주면 백엔드로 전달
  const handleGoogleCallback = async (response: { credential: string }) => {
    try {
      const result = await googleLoginApiCall(response.credential);
      if (result && result.success === true && completeLogin(result.data)) {
        return;
      }
      alert(result?.message || "구글 로그인에 실패했습니다.");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "구글 로그인 중 오류가 발생했습니다.",
      );
    }
  };

  // Google Identity Services 스크립트를 동적으로 로드하고 버튼을 렌더링
  useEffect(() => {
    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderGoogleButton = () => {
      const google = (window as any).google;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!google || !clientId) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });
      const container = document.getElementById("googleSignInDiv");
      if (container) {
        google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: 320,
        });
      }
    };

    if (script) {
      renderGoogleButton();
      return;
    }

    script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    //간단히 loginApicall을 부르기위한
    e?.preventDefault(); // form 제출 시 페이지 새로고침 방지

    if (!id || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    } // 빈칸인지 아닌지 검사하기
    try {
      const result = await loginApiCall(id, password); // loginApi.ts한테 아이디 비번 가지고 서버에서 맞는지 확인해라

      if (result && result.success === true) {
        if (completeLogin(result.data)) return;
        alert(
          "로그인은 성공했지만 회원 번호를 받지 못했습니다. 백엔드 응답을 확인해주세요.",
        );
      } else {
        alert(result?.message || "로그인 정보를 확인해주세요."); // 물음표를 쓰는이유는 값이 없을떄 강제꺼짐을 방지
      }
    } catch (error: any) {
      // 서버가 이유를 알려주면(입력값 오류, 요청 과다 등) 그대로 보여주고,
      // 인터넷 끊김등의 예기치 못한 사고일때는 기본 문구로 안내
      alert(
        error.response?.data?.message || "서버와 통신이 원활하지 않습니다.",
      );
    }
  };

  // 화면 표시용 상태 (포커스된 입력칸, 비밀번호 보기, 버튼 hover)
  const [focused, setFocused] = useState<"id" | "password" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitHover, setIsSubmitHover] = useState(false);
  const hasGoogleLogin = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div style={s.page}>
      {/* 왼쪽: 브랜드 패널 */}
      <AuthBrandPanel />

      {/* 오른쪽: 로그인 폼 */}
      <main style={s.formSide}>
        <div style={s.formBox}>
          <h1 style={s.title}>로그인</h1>
          <p style={s.subtitle}>ZCS 계정으로 로그인하세요.</p>

          <form onSubmit={handleLogin} style={s.form}>
            <label style={s.field}>
              <span style={s.label}>아이디</span>
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onFocus={() => setFocused("id")}
                onBlur={() => setFocused(null)}
                style={{
                  ...s.input,
                  ...(focused === "id" ? s.inputFocus : {}),
                }}
              />
            </label>

            <label style={s.field}>
              <span style={s.label}>비밀번호</span>
              <div style={s.inputWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...s.input,
                    paddingRight: 44,
                    ...(focused === "password" ? s.inputFocus : {}),
                  }}
                />
                <button
                  type="button"
                  style={s.eyeButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              style={{ ...s.submit, ...(isSubmitHover ? s.submitHover : {}) }}
              onMouseEnter={() => setIsSubmitHover(true)}
              onMouseLeave={() => setIsSubmitHover(false)}
            >
              로그인
            </button>
          </form>

          <div style={s.linkRow}>
            <button
              type="button"
              style={s.linkButton}
              onClick={() => navigation("/find-id")}
            >
              아이디 찾기
            </button>
            <span>|</span>
            <button
              type="button"
              style={s.linkButton}
              onClick={() => navigation("/forgot-password")}
            >
              비밀번호 재설정
            </button>
          </div>

          {/* 구글 클라이언트 ID가 있을 때만 (로컬에 .env 없으면 빈 칸만 남아서) */}
          {hasGoogleLogin && (
            <>
              <div style={s.divider}>
                <span style={s.dividerLine} />
                <span>또는</span>
                <span style={s.dividerLine} />
              </div>

              {/* 구글 로그인 버튼이 그려지는 자리 (위 useEffect에서 렌더링) */}
              <div
                id="googleSignInDiv"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  minHeight: 44,
                }}
              />
            </>
          )}

          <div style={s.signupRow}>
            계정이 없으신가요?
            <button
              type="button"
              style={s.signupLink}
              onClick={() => navigation("/signup")}
            >
              회원가입
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
