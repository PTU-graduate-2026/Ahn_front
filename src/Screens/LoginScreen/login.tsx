import React, { useEffect, useState } from "react";
import CommonStyle from "../../styles/CommonStyle";
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

  // 로그인 응답에 토큰이 있으면 저장하고 대시보드로 이동
  const completeLogin = (data: any) => {
    if (data?.membSeq && data?.accessToken) {
      setCurrentUser({
        membSeq: data.membSeq,
        membNm: data.membNm,
        accessToken: data.accessToken,
        expiresIn: data.expiresIn,
      });
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
      alert(error.response?.data?.message || "구글 로그인 중 오류가 발생했습니다.");
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
        alert("로그인은 성공했지만 로그인 토큰을 받지 못했습니다. 백엔드 응답을 확인해주세요.");
      } else {
        alert(result?.message || "로그인 정보를 확인해주세요."); // 물음표를 쓰는이유는 값이 없을떄 강제꺼짐을 방지
      }
    } catch (error: any) {
      // 서버가 이유를 알려주면(입력값 오류, 요청 과다 등) 그대로 보여주고,
      // 인터넷 끊김등의 예기치 못한 사고일때는 기본 문구로 안내
      alert(error.response?.data?.message || "서버와 통신이 원활하지 않습니다.");
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: CommonStyle.colors.background, // 설정값 사용
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
      fontSize: "42px",
      fontWeight: "900",
      color: CommonStyle.colors.mainNavy,
      marginBottom: "40px",
      letterSpacing: "1px",
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
      transition: "border-color 0.2s",
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
      transition: "background-color 0.3s",
    },
    footer: {
      marginTop: "30px",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      fontSize: "14px",
      color: CommonStyle.colors.textGray,
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "24px 0",
      color: CommonStyle.colors.textGray,
      fontSize: "13px",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      backgroundColor: CommonStyle.colors.divider,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ZCS</h1>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <input
            type="text"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={styles.input}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = CommonStyle.colors.mainNavy)
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = CommonStyle.colors.border)
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = CommonStyle.colors.mainNavy)
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = CommonStyle.colors.border)
            }
          />

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor =
                CommonStyle.colors.darkNavy)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor =
                CommonStyle.colors.mainNavy)
            }
          >
            Sign In
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span>또는</span>
          <span style={styles.dividerLine} />
        </div>

        <div
          id="googleSignInDiv"
          style={{ display: "flex", justifyContent: "center" }}
        />

        <div style={styles.footer}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigation("/find-id")}
          >
            아이디 찾기
          </span>
          <span style={{ color: CommonStyle.colors.divider }}>|</span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigation("/forgot-password")}
          >
            비밀번호 재설정
          </span>
          <span style={{ color: CommonStyle.colors.divider }}>|</span>
          <span
            onClick={() => navigation("/signup")}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              color: CommonStyle.colors.mainNavy,
            }}
          >
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}
