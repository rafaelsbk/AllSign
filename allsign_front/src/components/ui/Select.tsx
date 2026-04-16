import React from 'react';
import { 
  Select as AriaSelect, 
  Label, 
  Button, 
  SelectValue, 
  Popover, 
  ListBox, 
  ListBoxItem, 
  type SelectProps as AriaSelectProps,
  FieldError,
  Text
} from 'react-aria-components';
import { ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string;
  items: T[];
  children: React.ReactNode | ((item: T) => React.ReactNode);
  className?: string;
}

const Select = <T extends object>({ 
  label, 
  description, 
  errorMessage, 
  items, 
  children,
  className,
  ...props 
}: SelectProps<T>) => {
  return (
    <AriaSelect {...props} className={cn('flex flex-col gap-1', className)}>
      {({ isInvalid }) => (
        <>
          {label && <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</Label>}
          <Button
            className={({ isFocusVisible }) => cn(
              'flex items-center justify-between w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all focus:outline-none dark:bg-zinc-900',
              'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600',
              isFocusVisible && 'ring-2 ring-solar-gold/30 border-solar-gold',
              isInvalid && 'border-red-500 focus:ring-red-500/30',
              'disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-800'
            )}
          >
            <SelectValue className="text-zinc-900 dark:text-white" />
            <ChevronDown size={16} className="text-zinc-400" />
          </Button>
          {description && <Text slot="description" className="text-xs text-zinc-500">{description}</Text>}
          <FieldError className="text-xs font-medium text-red-600 dark:text-red-400">{errorMessage}</FieldError>
          <Popover className="min-w-[--trigger-width] overflow-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
            <ListBox items={items} className="p-1 outline-none">
              {children}
            </ListBox>
          </Popover>
        </>
      )}
    </AriaSelect>
  );
};

const SelectItem = (props: any) => {
  return (
    <ListBoxItem
      {...props}
      className={({ isFocused, isSelected }) => cn(
        'flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors',
        isFocused && 'bg-zinc-100 dark:bg-zinc-700',
        isSelected && 'bg-solar-orange/10 text-solar-orange font-bold dark:bg-solar-orange/20'
      )}
    />
  );
};

export { Select, SelectItem };
