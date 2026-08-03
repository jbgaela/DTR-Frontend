import { useState } from "react";
import { Button } from "../components/ui";
import { messages as m } from "../constants/messages";

export const LoginView = ({ onLogin, error }: { onLogin: (username: string, password: string) => Promise<void>; error: string }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return <main className="login-page"><section className="login-showcase"><div className="login-brand"><span className="login-brand-mark">D</span><span>{m.appName}</span></div><div className="login-showcase-copy"><p className="eyebrow">Attendance workspace</p><h1>Make every workday count.</h1><p>{m.appSubtitle}</p></div><div className="login-showcase-footer"><span className="status-dot" /> Secure access to your personal workspace</div></section><section className="login-panel"><form className="login-card" onSubmit={(event) => { event.preventDefault(); void onLogin(username, password); }}><div className="login-card-heading"><p className="eyebrow">{m.appName}</p><h2>Welcome back</h2><p>Sign in to manage your daily entries and keep every accomplishment on track.</p></div><label className="login-field"><span>{m.username}</span><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label className="login-field"><span>{m.password}</span><input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="error-banner" role="alert">{error}</p>}<Button type="submit">{m.signIn}<span aria-hidden="true">→</span></Button></form></section></main>;
};
