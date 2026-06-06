import './Button.scss';

interface ButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary';
  readonly disabled?: boolean;
  readonly as?: 'button' | 'span';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  as = 'button',
}: ButtonProps) {
  const className = `button button--${variant}`;

  if (as === 'span') {
    return <span className={className}>{children}</span>;
  }

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}