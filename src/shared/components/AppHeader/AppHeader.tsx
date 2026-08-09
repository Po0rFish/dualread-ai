import { NavLink } from 'react-router-dom';
import './AppHeader.scss';

interface AppHeaderProps {
  readonly context?: string;
}

export default function AppHeader({ context }: AppHeaderProps) {
  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `app-header__nav-link${isActive ? ' app-header__nav-link--active' : ''}`;

  return (
    <header className="app-header">
      <NavLink to="/" className="app-header__brand" aria-label="DualRead home">
        <span className="app-header__mark" aria-hidden="true"><span /><span /></span>
        <span>DualRead</span>
      </NavLink>
      {context && <p className="app-header__context">{context}</p>}
      <nav className="app-header__nav" aria-label="Primary navigation">
        <NavLink to="/" end className={linkClass}>Reader</NavLink>
        <NavLink to="/library" className={linkClass}>Library</NavLink>
      </nav>
    </header>
  );
}
