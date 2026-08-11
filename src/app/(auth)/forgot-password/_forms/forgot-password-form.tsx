'use client';

import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations as useNextTranslations } from 'next-intl';
import { useTranslations } from '@/shared/service/locale/use-translations';
import { Button, FormControl, FormInfo, TextInput } from '@/lib/ui';
import { AUTH_ROUTES } from '@/shared';
import { forgotPassword } from '../_actions';

export function ForgotPasswordForm() {
  const [state, forgotPasswordAction, isPending] = useActionState(forgotPassword, {
    status: 'idle',
    form: { email: '' },
  });
  const [isNavigating, startTransition] = useTransition();
  const router = useRouter();

  const t = useTranslations();
  const tNext = useNextTranslations();

  const errors = state.status === 'validation-error' ? state.errors : undefined;

  const handleGoBack = () => {
    startTransition(() => {
      router.push(AUTH_ROUTES.signIn);
    });
  };

  if (state.status === 'success') {
    return <FormInfo state={state} text={t('forgotPassword.success', { email: state.data.email })} />;
  }

  const isProcessing = isPending || isNavigating;

  return (
    <>
      <div className="pb-4">
        <p>{t('forgotPassword.info')}</p>
      </div>
      <form noValidate action={forgotPasswordAction} className="flex flex-col gap-y-4">
        <FormInfo state={state} text={t('forgotPassword.error')} />
        <FormControl errors={errors} name="email">
          {({ name, isInvalid, errorMessage }) => (
            <TextInput
              errorMessage={errorMessage}
              inputProps={{ placeholder: tNext('forms.email') }}
              isInvalid={isInvalid}
              isReadOnly={isProcessing}
              label={t('forms.email')}
              name={name}
              type="email"
            />
          )}
        </FormControl>
        <FormControl>
          {() => (
            <div className="flex justify-end gap-2">
              <div>
                <Button
                  className="flex"
                  icon="arrow-left"
                  intent="ghost"
                  isDisabled={isProcessing}
                  isLoading={isNavigating}
                  size="lg"
                  type="button"
                  onClick={handleGoBack}
                >
                  {isNavigating ? 'Going back...' : t('ctaLabels.goBack')}
                </Button>
              </div>
              <div>
                <Button isDisabled={isProcessing} isLoading={isPending} size="lg" type="submit">
                  {isPending ? 'Submitting...' : t('ctaLabels.submit')}
                </Button>
              </div>
            </div>
          )}
        </FormControl>
      </form>
    </>
  );
}
