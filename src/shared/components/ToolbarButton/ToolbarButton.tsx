import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './ToolbarButton.scss';

interface ToolbarButtonProps {
  readonly children: ReactNode;
  readonly onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function ToolbarButton({
  children,
  onClick,
  active = false,
  disabled = false,
  className,
}: ToolbarButtonProps) {
  const toolbarButtonClassName = [
    'toolbar-button',
    active ? 'toolbar-button--active' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={toolbarButtonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}