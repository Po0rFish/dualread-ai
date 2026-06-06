import clsx from 'clsx';

import './ToolbarButton.scss';

interface ToolbarButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly active?: boolean;
  readonly disabled?: boolean;
}

export function ToolbarButton({
  children,
  onClick,
  active = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={clsx('toolbar-button', {
        'toolbar-button--active': active,
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}