import type { ReactNode } from 'react';
import './EmptyState.scss';

interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h1 className="empty-state__title">{title}</h1>

      {description && (
        <p className="empty-state__description">
          {description}
        </p>
      )}

      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
    </section>
  );
}