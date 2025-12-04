import { forwardRef, InputHTMLAttributes } from 'react';
import { Icon } from './Icon';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, size = 'md', className = '', ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={`${styles.inputContainer} ${styles[size]} ${error ? styles.error : ''}`}>
          {prefix && <span className={styles.prefix}>{prefix}</span>}
          <input
            ref={ref}
            className={styles.input}
            {...props}
          />
          {suffix && <span className={styles.suffix}>{suffix}</span>}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Number input with increment/decrement buttons
interface NumberInputProps extends Omit<InputProps, 'type'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  size = 'md',
  className = '',
  ...props
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className={`${styles.numberInputWrapper} ${styles[size]} ${className}`}>
      <input
        type="number"
        className={styles.numberInput}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        {...props}
      />
      <div className={styles.spinButtons}>
        <button
          type="button"
          className={styles.spinButton}
          onClick={handleIncrement}
          disabled={value >= max}
          tabIndex={-1}
        >
          <Icon name="chevronUp" size={10} />
        </button>
        <button
          type="button"
          className={styles.spinButton}
          onClick={handleDecrement}
          disabled={value <= min}
          tabIndex={-1}
        >
          <Icon name="chevronDown" size={10} />
        </button>
      </div>
    </div>
  );
}

export default Input;