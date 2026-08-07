'use client';

import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { useRef } from 'react';
import { useTranslations as useNextTranslations } from 'next-intl';
import { Hamburger } from '@/lib/ui/components/navigation/hamburger';
import { cn } from '@/shared';
import { Navbar } from '@/lib/ui/components/navigation/navbar';
import { useModal } from '@/lib/ui/hooks';
import { type MeDto } from '@/api/hris/authentication/model/dtos/employee.dto';
import { type SerializedPermissions } from '@/api/hris/authorization/client';

type Props = {
  account: MeDto;
  permissions: SerializedPermissions;
};

export function MobileNavigation({ account, permissions }: Props): JSX.Element {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tNext = useNextTranslations('navigation');
  const { isOpen, openModal, closeModal, setIsOpen } = useModal();

  return (
    <>
      <Hamburger isOpen={isOpen} onPress={openModal} />
      <ModalOverlay
        isDismissable
        className={({ isEntering, isExiting }) =>
          cn('fixed inset-0 z-50 overflow-x-hidden bg-black/50 backdrop-blur-sm md:hidden', {
            'animate-show': isEntering,
            'animate-hide': isExiting,
          })
        }
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <Modal
          isDismissable
          className={({ isEntering, isExiting }) =>
            cn(
              'absolute bottom-0 right-0 top-14 z-50 w-64 overflow-y-auto border-l border-gray-200 bg-white shadow-2xl',
              {
                'animate-slide-in-horizontal': isEntering,
                'animate-slide-out-horizontal': isExiting,
              },
            )
          }
          ref={overlayRef}
        >
          <Dialog aria-label={tNext('mobileMenu')} className="outline-none">
            <Navbar isExpanded account={account} permissions={permissions} onLinkClick={closeModal} />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
