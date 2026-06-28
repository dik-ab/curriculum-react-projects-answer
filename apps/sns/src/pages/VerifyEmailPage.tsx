import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/apiClient";

type Props = { path: string };
type Status = "loading" | "success" | "error";

export default function VerifyEmailPage({ path }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const requestedTokens = useRef(new Set<string>());

  useEffect(() => {
    const query = new URLSearchParams(path.split("?")[1]);
    const token = query.get("token");
    if (!token) {
      setStatus("error");
      setMessage("URLが正しくありません");
      return;
    }
    if (requestedTokens.current.has(token)) {
      return;
    }
    requestedTokens.current.add(token);

    apiFetch<{ message: string }>(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "確認に失敗しました");
      });
  }, [path]);

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="logo-mark">S</span>
          <span>SNS</span>
        </div>
        <h1>メールアドレスの確認</h1>
        {status === "loading" && <p className="status-text">確認しています...</p>}
        {status === "success" && (
          <>
            <p className="success">{message}</p>
            <p>
              <a className="primary-link" href="#/login">ログインへ進む</a>
            </p>
          </>
        )}
        {status === "error" && <p className="error">{message}</p>}
      </section>
    </main>
  );
}
