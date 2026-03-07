import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      await register(username, displayName, password);
      navigate("/workouts");
    } catch (err) {
      setError("회원가입에 실패했습니다. 이미 사용 중인 아이디일 수 있습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="아이디 (로그인·친구 검색용)"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="영문·숫자로 입력하세요"
            minLength={1}
            required
          />

          <Input
            label="사용자명 (표시될 이름)"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="표시될 이름을 입력하세요"
            minLength={1}
            required
          />

          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            minLength={1}
            required
          />

          <Input
            label="비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            회원가입
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-primary-600 hover:underline">
            로그인
          </Link>
        </p>
      </Card>
    </div>
  );
};
