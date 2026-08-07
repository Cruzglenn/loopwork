'use client';

import { useTransition } from 'react';
import { DialogTrigger } from 'react-aria-components';
import { useTranslations } from 'use-intl';
import { Button, Modal, ModalHeader, TextInput } from '@/lib/ui';
import { Stack } from '@/lib/ui/components/stack';
import { useModal, useToast } from '@/lib/ui/hooks';
import { PAYROLL_TOASTS } from '@/shared/constants/toast-notifications';
import { generatePayrollRunAction } from '../_actions/generate-payroll.action';

export function GeneratePayrollButton(): JSX.Element {
  const t = useTranslations();
  const toast = useToast();
  const { isOpen, openModal, closeModal, setIsOpen } = useModal();
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]!;
  const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]!;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await generatePayrollRunAction(formData);
      if (res && 'error' in res) {
        toast(PAYROLL_TOASTS.GENERATE_ERROR);
      } else {
        toast(PAYROLL_TOASTS.GENERATE_SUCCESS);
        closeModal();
      }
    });
  };

  return (
    <DialogTrigger onOpenChange={setIsOpen}>
      <Button icon="add" intent="primary" onClick={openModal}>
        {t('payroll.generate')}
      </Button>
      <Modal isDismissable isOpen={isOpen}>
        <ModalHeader title="Generate Payroll Run" onClose={closeModal} />
        <form className="flex flex-col gap-5 pt-4" onSubmit={handleSubmit}>
          <TextInput
            isRequired
            defaultValue={defaultStartDate}
            inputProps={{ type: 'date' }}
            label="Pay Period Start Date"
            name="startDate"
          />
          <TextInput
            isRequired
            defaultValue={defaultEndDate}
            inputProps={{ type: 'date' }}
            label="Pay Period End Date"
            name="endDate"
          />
          <TextInput defaultValue="Monthly Payroll Run" label="Notes / Description" name="notes" />
          <Stack className="mt-2 self-end">
            <Button icon="close" intent="tertiary" isDisabled={isPending} type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button icon="ok" isLoading={isPending} type="submit">
              Generate Payroll
            </Button>
          </Stack>
        </form>
      </Modal>
    </DialogTrigger>
  );
}
