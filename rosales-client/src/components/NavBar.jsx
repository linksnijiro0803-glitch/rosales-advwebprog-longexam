import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';
import { useAuth } from '../hooks/useAuth';

const navLinkClassName = ({ isActive }) => [
  'rounded-lg px-3 py-2 text-sm font-semibold transition',
  isActive ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white',
].join(' ');

const NavBar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const publicLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Products', to: '/products' },
    { label: 'Articles', to: '/articles' },
  ];
  const links = isAdmin
    ? [...publicLinks, { label: 'Admin Dashboard', to: '/admin' }, { label: 'Account', to: '/account' }]
    : isAuthenticated
      ? [...publicLinks, { label: 'Cart', to: '/cart' }, { label: 'Orders', to: '/orders' }, { label: 'Account', to: '/account' }]
      : [...publicLinks, { label: 'Sign In', to: '/auth/signin' }, { label: 'Sign Up', to: '/auth/signup' }];

  const closeMenu = () => setIsOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-blue-800 bg-blue-950 text-white shadow-lg shadow-blue-950/10">
      <div className="page-shell flex min-h-18 items-center justify-between gap-4 py-3">
        <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={closeMenu}>
          <img src={logo} alt="Bulldogs Exchange logo" className="h-11 w-11 shrink-0 rounded-full bg-white object-contain p-0.5" />
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight sm:text-xl">Bulldogs Exchange</p>
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300 sm:block">Campus Marketplace</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/' || link.to === '/admin'} className={navLinkClassName}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <div className="ml-2 flex items-center gap-3 border-l border-white/20 pl-3">
              <span className="max-w-28 truncate text-xs font-medium text-blue-100" title={user?.name}>{user?.name}</span>
              <button type="button" onClick={handleLogout} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-blue-950 transition hover:bg-amber-300">
                Logout
              </button>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/30 text-xl lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span aria-hidden="true">{isOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {isOpen && (
        <nav id="mobile-navigation" className="page-shell border-t border-white/15 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="grid gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/' || link.to === '/admin'} className={navLinkClassName} onClick={closeMenu}>
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <button type="button" onClick={handleLogout} className="mt-2 rounded-lg bg-amber-400 px-4 py-3 text-left text-sm font-bold text-blue-950">
                Logout {user?.name ? `(${user.name})` : ''}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
