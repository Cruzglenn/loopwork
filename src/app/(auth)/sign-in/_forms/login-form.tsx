'use client';

import { useActionState } from 'react';
import { useTranslations as useNextTranslations } from 'next-intl';
import { useTranslations } from '@/shared/service/locale/use-translations';
import { Button, FormControl, FormInfo, TextInput } from '@/lib/ui';
import { PasswordInput } from '@/lib/ui/components/password-input';
import { loginUser } from '../_actions';

export function LoginForm() {
  const [state, loginUserAction, isPending] = useActionState(loginUser, {
    status: 'idle',
    form: { email: '', password: '' },
  });

  const t = useTranslations();
  const tNext = useNextTranslations();

  const errors = state.status === 'validation-error' ? state.errors : undefined;

  return (
    <form noValidate action={loginUserAction} className="flex flex-col gap-y-4">
      <FormInfo
        state={state}
        text={state.status === 'error' && state.error ? state.error : t('errorMessages.signInError')}
      />
      <FormControl errors={errors} name="email">
        {({ name, isInvalid, errorMessage }) => (
          <TextInput
            autoComplete="email"
            errorMessage={errorMessage}
            inputProps={{ placeholder: tNext('forms.email') }}
            isInvalid={isInvalid}
            isReadOnly={isPending}
            label={t('forms.email')}
            name={name}
            type="email"
          />
        )}
      </FormControl>
      <FormControl errors={errors} name="password">
        {({ name, isInvalid, errorMessage }) => (
          <PasswordInput
            autoComplete="current-password"
            errorMessage={errorMessage}
            inputProps={{ placeholder: tNext('forms.password') }}
            isInvalid={isInvalid}
            isReadOnly={isPending}
            label={t('forms.password')}
            name={name}
          />
        )}
      </FormControl>
      <Button className="mt-4" isDisabled={isPending} isLoading={isPending} size="lg" type="submit">
        {isPending ? 'Signing in...' : t('ctaLabels.signIn')}
      </Button>
    </form>
  );
}
