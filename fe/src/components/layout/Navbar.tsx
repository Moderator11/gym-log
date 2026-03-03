import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Dumbbell, LogOut } from "lucide-react";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary-600"
          >
            <Dumbbell size={28} />
            <span>운동 기록</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/workouts">
                  <Button variant="secondary" size="sm">
                    내 운동 기록
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={logout}>
                  <LogOut size={16} className="mr-1" />
                  로그아웃
                </Button>
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
    </nav>
  );
};
