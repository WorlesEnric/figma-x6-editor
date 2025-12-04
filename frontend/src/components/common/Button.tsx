import React from 'react';
import { Icon } from './Icon';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  active?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  active = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    active && styles.active,
    loading && styles.loading,
    !children && icon && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}>
          <Icon name="refresh" size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
        </span>
      )}
      {icon && iconPosition === 'left' && !loading && (
        <Icon name={icon} size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
      )}
      {children && <span className={styles.label}>{children}</span>}
      {icon && iconPosition === 'right' && !loading && (
        <Icon name={icon} size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
      )}
    </button>
  );
}

// Icon-only button variant
export function IconButton({
  icon,
  active = false,
  size = 'md',
  tooltip,
  ...props
}: Omit<ButtonProps, 'children'> & { icon: string; tooltip?: string }) {
  return (
    <Button
      icon={icon}
      active={active}
      size={size}
      variant="ghost"
      title={tooltip}
      {...props}
    />
  );
}

export default Button;