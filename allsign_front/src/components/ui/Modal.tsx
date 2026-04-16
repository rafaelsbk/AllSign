import React from 'react';
import { 
  Modal as AriaModal, 
  ModalOverlay, 
  Dialog, 
  Heading, 
  Button as AriaButton,
  type ModalOverlayProps
} from 'react-aria-components';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps extends ModalOverlayProps {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: string;
}

const Modal = ({ 
  title, 
  children, 
  isOpen, 
  onClose, 
  maxWidth = 'max-w-2xl',
  ...props 
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          isOpen={isOpen}
          onOpenChange={onClose}
          isDismissable
          className={({ isEntering, isExiting }) => cn(
            'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm',
            isEntering && 'animate-in fade-in duration-300',
            isExiting && 'animate-out fade-out duration-200'
          )}
        >
          <AriaModal
            {...props}
            className={({ isEntering, isExiting }) => cn(
              'w-full bg-white dark:bg-zinc-800 rounded-lg shadow-crisp-lg overflow-hidden focus:outline-none border border-zinc-200 dark:border-zinc-700',
              maxWidth,
              isEntering && 'animate-in zoom-in-95 duration-300',
              isExiting && 'animate-out zoom-out-95 duration-200'
            )}
          >
            <Dialog className="relative outline-none">
              {({ close }) => (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <Heading slot="title" className="text-xl font-bold text-zinc-900 dark:text-white">
                      {title}
                    </Heading>
                    <AriaButton
                      onPress={close}
                      className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 outline-none focus:ring-2 focus:ring-solar-gold"
                    >
                      <X size={20} />
                    </AriaButton>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {children}
                  </div>
                </>
              )}
            </Dialog>
          </AriaModal>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export { Modal };
