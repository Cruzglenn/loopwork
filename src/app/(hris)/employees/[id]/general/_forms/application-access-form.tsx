'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/shared/service/locale/use-translations';
import {
  ContentBlock,
  FormControl,
  Section,
  TextInput,
  Form as FormComponent,
  ComboBox,
  Button,
} from '@/lib/ui';
import { type CUID, parseString } from '@/shared';
import { useToast } from '@/lib/ui/hooks';
import { type RoleListItemDto } from '@/api/hris/authorization/infrastructure/controllers/roles.controller';
import { EMPLOYEE_GENERAL_TOASTS } from '@/shared/constants/toast-notifications';
import { StringTools } from '@/shared/utils/string-tools';
import { createIdentityAction, updateIdentityAction, deleteIdentityAction } from '../_actions';

type Props = {
  employeeId: CUID;
  employeeEmail: string;
  identityId: CUID | null;
  identityEmail: string | null;
  identityRoles: string[];
  assignedRoles?: RoleListItemDto[];
  availableRoles: RoleListItemDto[];
  isDisabled?: boolean;
};

function IdentityForm({
  employeeId,
  employeeEmail,
  identityId,
  identityEmail,
  identityRoles,
  availableRoles,
  onSuccess,
}: Omit<Props, 'isDisabled' | 'assignedRoles'> & { onSuccess: () => void }) {
  const t = useTranslations();
  const pushToast = useToast();
  const router = useRouter();
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [sendNotification, setSendNotification] = useState<boolean>(false);
  const sendNotificationRef = useRef<HTMLInputElement>(null);

  const isUpdate = !!identityId;
  const currentRole = isUpdate ? availableRoles.find((r) => identityRoles.includes(r.key)) : null;
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    currentRole?.id || (availableRoles.length > 0 ? availableRoles[0].id : null),
  );

  const handleSuccess = () => {
    pushToast(isUpdate ? EMPLOYEE_GENERAL_TOASTS.IDENTITY_UPDATE : EMPLOYEE_GENERAL_TOASTS.IDENTITY_CREATE);
    onSuccess();
    router.refresh();
  };

  const handleError = (error?: string) => {
    pushToast({
      intent: 'error',
      label: 'employees.general.identity.deleteError',
      description: error,
    });
  };

  const handleGeneratePassword = () => {
    const generated = StringTools.createRandomString(12);
    setGeneratedPassword(generated);
  };

  const handleSaveClick = () => {
    if (sendNotificationRef.current) {
      sendNotificationRef.current.value = 'false';
    }
    setSendNotification(false);
  };

  const handleSaveAndNotifyClick = () => {
    if (sendNotificationRef.current) {
      sendNotificationRef.current.value = 'true';
    }
    setSendNotification(true);
  };

  return (
    <Section heading={t('employees.generalView.applicationAccess')} id="applicationAccess">
      <FormComponent
        key={`identity-form-${identityId || 'new'}-${generatedPassword}`}
        focusInputOnError
        action={isUpdate ? updateIdentityAction : createIdentityAction}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        defaultState={{
          status: 'idle',
          form: {
            email: identityEmail || employeeEmail,
            password: '',
            confirmPassword: '',
            roleKey: currentRole?.key || '',
          },
        }}
        onError={handleError}
        onSuccess={handleSuccess}
      >
        {(form, formErrors) => (
          <>
            <input name="employeeId" type="hidden" value={employeeId} />
            {isUpdate && <input name="identityId" type="hidden" value={identityId} />}
            <input defaultValue="false" name="sendNotification" ref={sendNotificationRef} type="hidden" />

            <FormControl errors={formErrors} name="email">
              {(formState) => (
                <TextInput
                  autoFocus
                  defaultValue={form.email}
                  isRequired={!isUpdate}
                  label={t('employees.generalView.email')}
                  type="email"
                  {...formState}
                />
              )}
            </FormControl>

            <div className="flex items-end gap-2">
              <FormControl errors={formErrors} name="password">
                {(formState) => (
                  <div className="flex-1">
                    <TextInput
                      key={`password-${generatedPassword}`}
                      defaultValue={generatedPassword}
                      inputProps={{
                        placeholder: isUpdate ? 'Leave empty to keep current password' : undefined,
                      }}
                      isRequired={!isUpdate}
                      label={t('employees.generalView.password')}
                      {...formState}
                    />
                  </div>
                )}
              </FormControl>
              <Button intent="secondary" size="md" type="button" onClick={handleGeneratePassword}>
                {t('employees.generalView.generate')}
              </Button>
            </div>

            <FormControl errors={formErrors} name="confirmPassword">
              {(formState) => (
                <TextInput
                  key={`confirmPassword-${generatedPassword}`}
                  defaultValue={generatedPassword}
                  inputProps={{
                    placeholder: isUpdate ? 'Leave empty to keep current password' : undefined,
                  }}
                  isRequired={!isUpdate}
                  label={t('employees.generalView.confirmPassword')}
                  {...formState}
                />
              )}
            </FormControl>

            <FormControl errors={formErrors} name="roleKey">
              {(formState) => (
                <>
                  <ComboBox
                    errorMessage={formState.errorMessage as string}
                    inputProps={{ placeholder: t('employees.generalView.selectRole') as string }}
                    isInvalid={formState.isInvalid}
                    isRequired={!isUpdate}
                    items={availableRoles.map((role) => ({ key: role.id, label: role.name }))}
                    label="Role"
                    name={undefined}
                    selectedKey={selectedRoleId}
                    selectionMode="single"
                    onSelectionChange={(key) => {
                      setSelectedRoleId(key as string | null);
                    }}
                  />
                  <input
                    name="roleKey"
                    type="hidden"
                    value={
                      selectedRoleId
                        ? availableRoles.find((r) => r.id === selectedRoleId)?.key || ''
                        : currentRole?.key || ''
                    }
                  />
                </>
              )}
            </FormControl>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <FormControl>
                {({ isSubmitting }) => (
                  <>
                    <Button
                      icon="ok"
                      intent="primary"
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting && !sendNotification}
                      name="sendNotification"
                      type="submit"
                      value="false"
                      onClick={handleSaveClick}
                    >
                      {t('ctaLabels.save')}
                    </Button>
                    <Button
                      icon="ok"
                      intent="secondary"
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting && sendNotification}
                      name="sendNotification"
                      type="submit"
                      value="true"
                      onClick={handleSaveAndNotifyClick}
                    >
                      {t('employees.generalView.saveAndNotify')}
                    </Button>
                    <Button
                      icon="close"
                      intent="tertiary"
                      isDisabled={isSubmitting}
                      type="button"
                      onClick={onSuccess}
                    >
                      {t('ctaLabels.cancel')}
                    </Button>
                  </>
                )}
              </FormControl>
            </div>
          </>
        )}
      </FormComponent>
    </Section>
  );
}

export function ApplicationAccessForm({
  employeeId,
  employeeEmail,
  identityId,
  identityEmail,
  identityRoles,
  assignedRoles = [],
  availableRoles,
  isDisabled,
}: Props): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const pushToast = useToast();

  const handleDelete = async () => {
    if (!identityId) return;
    if (!confirm(t('employees.generalView.confirmDeleteIdentity') as string)) return;

    const result = await deleteIdentityAction(identityId, employeeId);
    if (result.status === 'success') {
      pushToast(EMPLOYEE_GENERAL_TOASTS.IDENTITY_DELETE);
      setIsDeleting(false);
      router.refresh();
    } else {
      pushToast(EMPLOYEE_GENERAL_TOASTS.IDENTITY_DELETE_ERROR);
    }
  };

  const handleSuccess = () => {
    setIsEditing(false);
  };

  // Show form if editing
  if (isEditing) {
    return (
      <IdentityForm
        availableRoles={availableRoles}
        employeeEmail={employeeEmail}
        employeeId={employeeId}
        identityEmail={identityEmail}
        identityId={identityId}
        identityRoles={identityRoles}
        onSuccess={handleSuccess}
      />
    );
  }

  // Read mode - show data
  const displayRole =
    assignedRoles.length > 0 ? assignedRoles[0] : availableRoles.find((r) => identityRoles.includes(r.key));

  return (
    <Section
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-y-10"
      heading={t('employees.generalView.applicationAccess')}
      id="applicationAccess"
      isEdit={!isDisabled}
      onEdit={() => setIsEditing(true)}
    >
      {!identityId ? (
        <ContentBlock label={t('employees.generalView.status')}>
          {t('employees.generalView.noAccess')}
        </ContentBlock>
      ) : (
        <>
          <ContentBlock label={t('employees.generalView.email')}>{parseString(identityEmail)}</ContentBlock>
          <ContentBlock label="Role">
            {displayRole ? (
              <div className="flex items-center gap-2">
                <p>{displayRole.name}</p>
                {displayRole.isSystem && (
                  <span className="text-text-light-body text-xs">
                    ({t('employees.generalView.systemRole')})
                  </span>
                )}
              </div>
            ) : (
              '-'
            )}
          </ContentBlock>
          <div className="flex gap-2 sm:col-span-2">
            <Button intent="danger" isDisabled={isDisabled} onClick={() => setIsDeleting(true)}>
              {t('employees.generalView.revokeAccess')}
            </Button>
          </div>
          {isDeleting && (
            <div className="bg-warning/10 rounded-md border border-warning p-4 sm:col-span-2">
              <p className="mb-4 text-sm text-warning">{t('employees.generalView.confirmDeleteIdentity')}</p>
              <div className="flex gap-2">
                <Button intent="danger" onClick={handleDelete}>
                  {t('employees.generalView.delete')}
                </Button>
                <Button intent="secondary" onClick={() => setIsDeleting(false)}>
                  {t('employees.generalView.cancel')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
