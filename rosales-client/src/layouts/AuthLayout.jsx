import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';

const AuthLayout = () => {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-blue-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-amber-400/20" />
          <Link to="/" className="relative flex items-center gap-3">
            <img src={logo} alt="Bulldogs Exchange logo" className="h-14 w-14 rounded-full bg-white p-1" />
            <span className="text-xl font-black">Bulldogs Exchange</span>
          </Link>
          <div className="relative max-w-lg">
            <p className="eyebrow !text-amber-300">Made for the community</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">A trusted marketplace for every Bulldog.</h2>
            <p className="mt-5 leading-7 text-blue-100">Find campus essentials and exchange useful items with fellow members of the Bulldogs community.</p>
          </div>
          <p className="relative text-sm text-blue-200">Simple. Local. Community-first.</p>
        </div>

        <main className="flex items-center px-5 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" className="mb-10 flex items-center gap-3 text-blue-950 lg:hidden">
              <img src={logo} alt="Bulldogs Exchange logo" className="h-11 w-11 rounded-full bg-white object-contain shadow-sm" />
              <span className="font-black">Bulldogs Exchange</span>
            </Link>
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
};

export default AuthLayout;
