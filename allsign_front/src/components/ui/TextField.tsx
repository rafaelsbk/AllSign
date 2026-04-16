import { useState } from 'react';
import { 
  TextField as AriaTextField, 
  Label, 
  Input, 
  FieldError, 
  Text, 
  type TextFieldProps as AriaTextFieldProps 
} from 'react-aria-components';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: any) => string);
  placeholder?: string;
  className?: string;
  type?: string;
}

const TextField = ({ 
  label, 
  description, 
  errorMessage, 
  placeholder,
  className,
  type = 'text',
  ...props 
}: TextFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <AriaTextField {...props} className={cn('flex flex-col gap-1', className)}>
      {label && <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</Label>}
      <div className="relative">
        <Input
          type={inputType}
          placeholder={placeholder}
          className={({ isFocusVisible, isInvalid }) => cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all focus:outline-none',
            'border-zinc-300 hover:border-zinc-400 text-zinc-900',
            isFocusVisible && 'ring-2 ring-solar-gold/30 border-solar-gold',
            isInvalid && 'border-red-500 focus:ring-red-500/30',
            'disabled:opacity-50 disabled:bg-zinc-100',
            isPasswordType && 'pr-10'
          )}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {description && <Text slot="description" className="text-xs text-zinc-500">{description}</Text>}
      <FieldError className="text-xs font-medium text-red-600 dark:text-red-400">
        {errorMessage}
      </FieldError>
    </AriaTextField>
  );
};

export { TextField };
