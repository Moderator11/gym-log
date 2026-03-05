import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Dumbbell, LogOut, Tag, Menu, X, Users, BarChart2, Activity, Timer } from "lucide-react";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 데스크톱 전체 메뉴
  const navLinks = [
    { to: "/workouts", label: "운동 기록", icon: <Dumbbell size={16} /> },
    { to: "/categories", label: "카테고리", icon: <Tag size={16} /> },
    { to: "/health", label: "건강 기록", icon: <Activity size={16} /> },
    { to: "/friends", label: "친구", icon: <Users size={16} /> },
    { to: "/stats", label: "통계", icon: <BarChart2 size={16} /> },
    { to: "/timer", label: "타이머", icon: <Timer size={16} /> },
  ];

  // 모바일 상단 바에 바로 노출할 퀵 링크
  const mobileQuickLinks = [
    { to: "/workouts", label: "운동 기록", icon: <Dumbbell size={20} /> },
    { to: "/timer", label: "타이머", icon: <Timer size={20} /> },
    { to: "/stats", label: "통계", icon: <BarChart2 size={20} /> },
  ];

  // 모바일 햄버거 메뉴에만 들어갈 링크
  const mobileMenuLinks = [
    { to: "/categories", label: "카테고리", icon: <Tag size={16} /> },
    { to: "/health", label: "건강 기록", icon: <Activity size={16} /> },
    { to: "/friends", label: "친구", icon: <Users size={16} /> },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* 로고 */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold text-primary-600"
          >
            <Dumbbell size={24} />
            <span>짐로그</span>
          </Link>

          {/* 데스크톱 메뉴 */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ to, label, icon }) => {
                const active = location.pathname.startsWith(to);
                return (
                  <Link key={to} to={to}>
                    <button
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* 우측 버튼 */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:flex"
                >
                  <LogOut size={15} className="mr-1" />
                  로그아웃
                </Button>

                {/* 모바일 퀵 링크 (운동기록·타이머·통계) */}
                <div className="flex sm:hidden items-center">
                  {mobileQuickLinks.map(({ to, label, icon }) => {
                    const active = location.pathname.startsWith(to);
                    return (
                      <Link key={to} to={to} aria-label={label}>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            active
                              ? "text-primary-600 bg-primary-50"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {icon}
                        </button>
                      </Link>
                    );
                  })}
                </div>

                {/* 모바일 햄버거 (나머지 메뉴) */}
                <button
                  className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  onClick={() => setMobileOpen((o) => !o)}
                  aria-label="더보기 메뉴"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 드롭다운 (카테고리·건강기록·친구·로그아웃) */}
      {isAuthenticated && mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {mobileMenuLinks.map(({ to, label, icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      )}
    </nav>
  );
};
