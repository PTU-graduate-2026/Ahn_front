// 백엔드 PasswordPolicy 와 같은 규칙 (영문 + 숫자 포함, 공백 없이 8~64자)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/;

export const PASSWORD_POLICY_MESSAGE =
  "비밀번호는 영문과 숫자를 포함해 공백 없이 8~64자로 입력해주세요.";

export const isValidPassword = (password: string) => PASSWORD_REGEX.test(password);

// 회원가입 화면에서 조건별로 체크 표시할 때 사용 (위 PASSWORD_REGEX와 같은 조건)
export const getPasswordChecks = (password: string) => [
  { label: "영문 포함", ok: /[A-Za-z]/.test(password) },
  { label: "숫자 포함", ok: /\d/.test(password) },
  { label: "8~64자", ok: password.length >= 8 && password.length <= 64 },
  { label: "공백 없음", ok: password.length > 0 && !/\s/.test(password) },
];
