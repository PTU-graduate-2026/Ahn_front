// 백엔드 PasswordPolicy 와 같은 규칙 (영문 + 숫자 포함, 공백 없이 8~64자)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/;

export const PASSWORD_POLICY_MESSAGE =
  "비밀번호는 영문과 숫자를 포함해 공백 없이 8~64자로 입력해주세요.";

export const isValidPassword = (password: string) => PASSWORD_REGEX.test(password);
