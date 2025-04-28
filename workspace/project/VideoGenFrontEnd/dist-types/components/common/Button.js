import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import styles from './button.module.css';
export const Button = forwardRef(({ children, className = '', variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled, type = 'button', ...props }, ref) => {
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (_jsx("button", { ref: ref, type: type, className: classes, disabled: disabled || loading, ...props, children: loading ? _jsx("span", { className: styles.spinner, "aria-hidden": "true" }) : children }));
});
Button.displayName = 'Button';
