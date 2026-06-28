import { ReactNode } from 'react';
import { useHashRoute } from '../hooks/useHashRoute';
import { logout } from '../lib/apiClient';

type Props = {
  children: ReactNode;
};

export function Layout({ children }: Props) {
  const { path } = useHashRoute();

  const handleLogout = async () => {
    await logout();
    location.hash = '#/login';
  };

  const navItems = [
    { href: '#/', label: 'タイムライン', active: path === '/' },
    { href: '#/chat', label: 'チャット', active: path === '/chat' },
    { href: '#/settings', label: '設定', active: path === '/settings' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <a className="logo" href="#/">
          <span className="logo-mark">S</span>
          <span>SNS</span>
        </a>
        <nav className="nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              className={item.active ? 'nav-link nav-link-active' : 'nav-link'}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
          <button className="logout-button" onClick={handleLogout}>
            ログアウト
          </button>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
