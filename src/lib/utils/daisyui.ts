// DaisyUI utilities for the laundry management system
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  outline?: boolean;
  disabled?: boolean;
  loading?: boolean;
  wide?: boolean;
  block?: boolean;
  circle?: boolean;
  square?: boolean;
  glass?: boolean;
}

export interface ModalProps {
  open?: boolean;
  responsive?: boolean;
  backdrop?: boolean;
}

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  outline?: boolean;
}
