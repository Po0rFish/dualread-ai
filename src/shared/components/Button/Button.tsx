import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.scss';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  readonly children: ReactNode;
  readonly onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
  readonly as?: 'button' | 'span';
  readonly className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  as = 'button',
  className,
}: ButtonProps) {
  const buttonClassName = [
    'button',
    `button--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (as === 'span') {
    return <span className={buttonClassName}>{children}</span>;
  }

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}