import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

type Props = {
  navigate: (to: string) => void;
};

export default function LoginPage({ navigate }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="logo-mark">S</span>
          <span>SNS</span>
        </div>
        <h1>ログイン</h1>
        <form onSubmit={handleSubmit}>
          <label>
            メールアドレス
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            パスワード
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="auth-switch">
          アカウントがない場合は <a href="#/register">ユーザー登録</a>
        </p>
      </section>
    </main>
  );
}
