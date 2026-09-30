import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  withdrawMember,
  type WithdrawCredential,
} from "../services/_private/Member/MemberApi";
import { scanResultStyles as styles } from "../styles/scanResult";

type WithdrawModalProps = {
  onClose: () => void;
  onWithdrawn: (message: string) => void;
};

const GOOGLE_BUTTON_ID = "withdrawGoogleDiv";

// 회원 탈퇴 확인 모달.
// 아이디/비밀번호 계정은 비밀번호로, 구글로 가입한 계정은 구글 로그인으로 본인확인을 한다.
export function WithdrawModal({ onClose, onWithdrawn }: WithdrawModalProps) {
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 구글 버튼 콜백은 한 번 등록되면 그 시점의 state만 보므로, 최신 값을 ref로 전달한다.
  const agreedRef = useRef(agreed);
  agreedRef.current = agreed;
  const submittingRef = useRef(submitting);
  submittingRef.current = submitting;

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const submit = async (credential: WithdrawCredential) => {
    if (submittingRef.current) return;
    if (!agreedRef.current) {
      setError("안내 내용을 확인하고 동의에 체크해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result = await withdrawMember(credential);
      if (result?.success) {
        onWithdrawn(result.message || "회원 탈퇴가 완료되었습니다.");
        return;
      }
      setError(result?.message || "회원 탈퇴에 실패했습니다.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "회원 탈퇴 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    submit({ membPwd: password });
  };

  // 구글 스크립트(Google Identity Services)는 로그인 화면에서만 불러오므로,
  // 새로고침 등으로 아직 없으면 여기서 불러온다. (로그인 화면과 같은 script id를 써서 중복 로드 방지)
  const [googleReady, setGoogleReady] = useState(
    () => !!(window as any).google?.accounts?.id,
  );

  useEffect(() => {
    if (!googleClientId || googleReady) return;
    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const onLoad = () => setGoogleReady(true);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    return () => script?.removeEventListener("load", onLoad);
  }, [googleClientId, googleReady]);

  // 구글 버튼을 모달 안에 그린다. 콜백으로 받은 ID 토큰을 탈퇴 본인확인에 쓴다.
  useEffect(() => {
    const google = (window as any).google;
    if (!googleClientId || !googleReady || !google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: { credential: string }) => {
        submit({ idToken: response.credential });
      },
    });
    const container = document.getElementById(GOOGLE_BUTTON_ID);
    if (container) {
      google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: 300,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId, googleReady]);

  const canSubmitPassword = !!password && agreed && !submitting;
  const googleAvailable = !!googleClientId && googleReady;

  // document.body에 직접 그린다(포털). Topbar의 header에 backdropFilter가 있어서,
  // header 안에 그리면 position: fixed가 화면이 아니라 70px짜리 header 기준이 되어
  // 모달 윗부분(안내 문구)이 화면 밖으로 잘려 보이지 않았다.
  return createPortal(
    <div style={styles.modalOverlay} onClick={submitting ? undefined : onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>회원 탈퇴</h2>
          <button
            type="button"
            style={styles.modalCloseButton}
            onClick={onClose}
            disabled={submitting}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.errorBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <AlertTriangle size={16} />
              <strong>탈퇴하면 되돌릴 수 없습니다.</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
              <li>계정 정보가 삭제되어 같은 아이디로 다시 로그인할 수 없습니다.</li>
              <li>업로드한 파일과 모든 분석 결과·히스토리가 함께 삭제됩니다.</li>
              <li>삭제된 데이터는 복구할 수 없습니다.</li>
            </ul>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={submitting}
            />
            위 내용을 확인했으며 회원 탈퇴에 동의합니다.
          </label>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={styles.formLabel} htmlFor="withdraw-password">
              비밀번호 확인
            </label>
            <input
              id="withdraw-password"
              type="password"
              autoComplete="current-password"
              placeholder="현재 비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.formInput}
              disabled={submitting}
            />
            <button
              type="submit"
              style={{
                ...styles.primaryButton,
                background: "#dc2626",
                borderColor: "#dc2626",
                justifyContent: "center",
                ...(!canSubmitPassword ? styles.disabledButton : {}),
              }}
              disabled={!canSubmitPassword}
            >
              {submitting ? "탈퇴 처리 중..." : "비밀번호 확인 후 탈퇴"}
            </button>
          </form>

          {googleAvailable && (
            <>
              <p style={styles.formHint}>
                구글 계정으로 가입하셨다면 비밀번호 대신 아래 버튼으로 본인확인을 해주세요.
                (동의에 먼저 체크해야 합니다.)
              </p>
              <div id={GOOGLE_BUTTON_ID} style={{ display: "flex", justifyContent: "center" }} />
            </>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button type="button" style={styles.button} onClick={onClose} disabled={submitting}>
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
