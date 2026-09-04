import { Link } from 'react-router-dom';

const variantClasses = {
  primary: 'border-blue-950 bg-blue-950 text-white shadow-sm hover:border-blue-800 hover:bg-blue-800',
  secondary: 'border-slate-300 bg-white text-slate-800 hover:border-blue-950 hover:text-blue-950',
  danger: 'border-red-200 bg-white text-red-700 hover:border-red-700 hover:bg-red-50',
};

const Button = ({
  children,
  to,
  type = 'button',
  variant = 'secondary',
  className = '',
  disabled = false,
  ...props
}) => {
  const classes = [
    'inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
    variantClasses[variant] ?? variantClasses.secondary,
    disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : '',
    className,
  ]
    .join(' ')
    .trim();

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
