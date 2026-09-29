import React from "react";

export const styles: Record<string, React.CSSProperties> = {
  // 1. 상단바 전체 컨테이너
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    height: "70px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderBottom: "1px solid #e2e8f0",
    // 스크롤해도 상단에 고정 (아래 섹션 위로 올라오게 zIndex)
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(8px)",
  },
  // 2. 로고 영역 (왼쪽)
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  logoBox: {
    padding: "5px 8px",
    fontWeight: "bold",
    fontSize: "50px",
    color: "#282e4c",
  },
  logoTextContainer: {
    display: "flex",
    flexDirection: "column",
  },
  // 3. 메뉴 영역 (오른쪽)
  navSection: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",
  },
  navItem: {
    fontSize: "14px",
    color: "#000000",
    cursor: "pointer",
    opacity: 0.8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",
  },
  login: {
    fontSize: "14px",
    color: "#000000",
    opacity: 0.8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",
  },
  // 4. 드롭다운 메뉴 (서비스 / 로그인 상태일 때 사용자 이름)
  userMenuWrapper: {
    position: "relative", // 드롭다운 위치 기준
  },
  userButton: {
    fontSize: "14px",
    color: "#000000",
    opacity: 0.8,
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: 0,
    minWidth: "140px",
    padding: "6px 0",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100, // 아래 Middle 배경 위로 올라오게
  },
  dropdownItem: {
    padding: "10px 16px",
    fontSize: "14px",
    color: "#1e293b",
    textAlign: "left",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",
  },
  dropdownItemDanger: {
    color: "#dc2626",
  },
};
