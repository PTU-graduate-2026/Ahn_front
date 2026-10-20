import { useId } from "react";

type ZcsLogoProps = {
  size?: number;
  // light: 밝은 배경용(남색) · dark: 남색 배경용(흰색)
  variant?: "light" | "dark";
  title?: string;
};

const colors = {
  light: { base: "#173357", accent: "#2F7DE1" },
  dark: { base: "#ffffff", accent: "#86B6EF" },
};

const RING = "M80.64 75.71A40 40 0 1 1 80.64 24.29";
const Z = "M0 0H46V12L15 52H46V64H0V52L31 12H0Z";
const Z_SMALL = "M0 0H46V14L17 50H46V64H0V50L29 14H0Z";
const S = "M36.5 13.5A16 13 0 1 0 22 32A16 13 0 1 1 7.5 50.5";

// ZCS 심볼: C 고리 안에 Z와 S를 겹친 모노그램 (32px 이하는 S를 빼고 C·Z만)
export default function ZcsLogo({ size = 40, variant = "light", title }: ZcsLogoProps) {
  const maskId = `zcs-knock-${useId().replace(/:/g, "")}`;
  const { base, accent } = colors[variant];
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };

  if (size <= 32) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" {...a11y}>
        <path d={RING} fill="none" stroke={base} strokeWidth={13} />
        <path d={Z_SMALL} fill={base} transform="translate(29 25) scale(0.78)" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...a11y}>
      {/* S가 Z 위로 지나가는 자리를 투명하게 비워 배경색과 상관없이 틈이 보이게 함 */}
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
        <rect width="100" height="100" fill="#fff" />
        <path d={S} fill="none" stroke="#000" strokeWidth={21.7} transform="translate(45.35 30.15) scale(0.62)" />
      </mask>
      <path d={RING} fill="none" stroke={base} strokeWidth={7.44} />
      <g mask={`url(#${maskId})`}>
        <path d={Z} fill={base} transform="translate(27.35 30.15) scale(0.62)" />
      </g>
      <path d={S} fill="none" stroke={accent} strokeWidth={12} transform="translate(45.35 30.15) scale(0.62)" />
    </svg>
  );
}
