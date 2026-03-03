import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      navigate("/workouts");
    } catch (err) {
      setError("로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="사용자명"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자명을 입력하세요"
            required
          />

          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            로그인
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <Link to="/register" className="text-primary-600 hover:underline">
            회원가입
          </Link>
        </p>
      </Card>
    </div>
  );
};
