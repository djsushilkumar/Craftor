export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonComponent = (props: ButtonProps) => {
  return {
    type: 'button',
    props,
  };
};
