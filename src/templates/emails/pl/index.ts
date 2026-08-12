import {
  activateOrganizationAccount,
  changePasswordTemplate,
  inviteTemplate,
} from '@/templates/emails/pl/activate-organization-account';

import { type Templates } from '@/shared/service/templates/email-template.service';
import { payslipDisbursedTemplate } from '../en/payslip-disbursed';
import { approveAbsenceTemplate, rejectAbsenceTemplate } from './absences-templates';

export const pl: Templates = {
  activateOrganizationAccount,
  changePasswordTemplate,
  inviteTemplate,
  approveAbsenceTemplate,
  rejectAbsenceTemplate,
  payslipDisbursedTemplate,
};
