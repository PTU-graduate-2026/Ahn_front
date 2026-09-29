import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { styles } from "../../styles/topbar";
import { getCurrentUserName, isLoggedIn, logout } from "../../utils/currentUser";

type MenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean; // true면 빨간 글씨 (회원 탈퇴 같은 위험한 동작)
};

type OpenMenu = "service" | "user" | null;

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // localStorage는 바뀌어도 화면이 다시 안 그려져서 state로 들고 있음
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  // 드롭다운은 한 번에 하나만 열리도록 state 하나로 관리
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // 메뉴 바깥을 클릭하면 드롭다운 닫기
  useEffect(() => {
    if (!openMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const toggleMenu = (menu: Exclude<OpenMenu, null>) =>
    setOpenMenu((prev) => (prev === menu ? null : menu));

  const handleLogout = () => {
    logout();
    setLoggedIn(false); // 소개화면에서는 그대로 있고 메뉴만 "로그인"으로 바뀜
    // 대시보드 등 로그인 전용 화면에서 로그아웃하면 로그인 화면으로
    if (location.pathname !== "/" && location.pathname !== "/intro") {
      navigate("/login");
    }
  };

  // TODO: 백엔드에 회원정보 수정 API 생기면 개인정보 수정 페이지로 연결
  const handleEditProfile = () => {
    alert("개인정보 수정 기능은 준비 중입니다.");
  };

  // TODO: 백엔드에 회원 탈퇴 API 생기면 호출 후 logout() 처리
  const handleWithdraw = () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;
    alert("회원 탈퇴 기능은 준비 중입니다.");
  };

  // 드롭다운 메뉴 목록 — 항목 추가/수정은 여기만 고치면 됨
  const serviceMenuItems: MenuItem[] = [
    { label: "파일 입력", onClick: () => navigate("/upload") },
    { label: "대시보드", onClick: () => navigate("/dashboard") },
    { label: "히스토리", onClick: () => navigate("/history") },
  ];

  const userMenuItems: MenuItem[] = [
    { label: "개인정보 수정", onClick: handleEditProfile },
    { label: "로그아웃", onClick: handleLogout },
    { label: "회원 탈퇴", onClick: handleWithdraw, danger: true },
  ];

  const renderDropdown = (items: MenuItem[]) => (
    <div role="menu" style={styles.dropdown}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          style={{
            ...styles.dropdownItem,
            ...(item.danger ? styles.dropdownItemDanger : {}),
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          onClick={() => {
            setOpenMenu(null);
            item.onClick();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <header style={styles.headerContainer}>
      {/* 로고 부분 */}
      <button
        type="button"
        onClick={() => navigate("/intro")}
        aria-label="홈으로 이동"
        style={{ ...styles.logoSection, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <div style={styles.logoBox}>
          <div style={{fontWeight: "bold", fontSize: "40px", color: "#1f4e8c" }}>
            ZCS
          </div>
        </div>

        <div style={styles.logoTextContainer}>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",fontWeight: "bold", fontSize: "14px", color: "#1f4e8c" }}>
            Zero Check SBOM
          </div>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",fontSize: "10px", color: "#aaa" }}>
            Security Service
          </div>
        </div>
      </button>

      {/* 메뉴 부분 */}
      <nav ref={navRef} style={styles.navSection}>
        {/* 서비스 메뉴 — 클릭하면 드롭다운 */}
        <div style={styles.userMenuWrapper}>
          <button
            type="button"
            style={styles.userButton}
            onClick={() => toggleMenu("service")}
            aria-haspopup="menu"
            aria-expanded={openMenu === "service"}
          >
            서비스 {openMenu === "service" ? "▴" : "▾"}
          </button>
          {openMenu === "service" && renderDropdown(serviceMenuItems)}
        </div>

        {/* 로그인 상태면 로그인 버튼 대신 사용자 이름 표시, 클릭하면 드롭다운 */}
        {loggedIn ? (
          <div style={styles.userMenuWrapper}>
            <button
              type="button"
              style={styles.userButton}
              onClick={() => toggleMenu("user")}
              aria-haspopup="menu"
              aria-expanded={openMenu === "user"}
            >
              {getCurrentUserName() ?? "사용자"}님 {openMenu === "user" ? "▴" : "▾"}
            </button>
            {openMenu === "user" && renderDropdown(userMenuItems)}
          </div>
        ) : (
          <span style={styles.login}onClick={() => navigate("/login")}>로그인</span>
        )}
      </nav>
    </header>
  );
};

export default Topbar;
