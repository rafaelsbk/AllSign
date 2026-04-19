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
            'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm md:pl-72',
            isEntering && 'animate-in fade-in duration-150',
            isExiting && 'animate-out fade-out duration-100'
          )}
        >
          <AriaModal
            {...props}
            className={({ isEntering, isExiting }) => cn(
              'w-full bg-white rounded-lg shadow-crisp-lg overflow-hidden focus:outline-none border border-zinc-200',
              maxWidth,
              isEntering && 'animate-in zoom-in-98 duration-150',
              isExiting && 'animate-out zoom-out-98 duration-100'
            )}
          >
            <Dialog className="relative outline-none">
              {({ close }) => (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <Heading slot="title" className="text-xl font-bold text-zinc-900">
                      {title}
                    </Heading>
                    <AriaButton
                      onPress={close}
                      className="p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500 hover:text-zinc-700 outline-none focus:ring-2 focus:ring-solar-gold"
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
