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

  const getErrorMessage = () => {
    if (state.status !== 'error' && state.status !== 'api-error') return undefined;
    const rawError = state.error;

    if (
      !rawError ||
      rawError === 'errorMessages.auth.invalidCredentials' ||
      rawError.includes('invalidCredentials')
    ) {
      return 'Invalid email or password';
    }

    if (rawError.startsWith('errorMessages.')) {
      try {
        return t(rawError.replace('errorMessages.', ''));
      } catch {
        return 'Invalid email or password';
      }
    }

    return rawError;
  };

  return (
    <form noValidate action={loginUserAction} className="flex flex-col gap-y-4">
      <FormInfo state={state} text={getErrorMessage()} />
      <FormControl errors={errors} name="email">
        {({ name, isInvalid, errorMessage }) => (
          <TextInput
            key={`email-${state.form?.email || ''}`}
            autoComplete="email"
            defaultValue={state.form?.email || ''}
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
            key={`password-${state.form?.password || ''}`}
            autoComplete="current-password"
            defaultValue={state.form?.password || ''}
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
