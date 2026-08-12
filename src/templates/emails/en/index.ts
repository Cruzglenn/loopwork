import {
  activateOrganizationAccount,
  changePasswordTemplate,
  inviteTemplate,
} from '@/templates/emails/en/activate-organization-account';
import { type Templates } from '@/shared/service/templates/email-template.service';
import { approveAbsenceTemplate, rejectAbsenceTemplate } from './absences-templates';
import { payslipDisbursedTemplate } from './payslip-disbursed';

export const en: Templates = {
  activateOrganizationAccount,
  changePasswordTemplate,
  inviteTemplate,
  approveAbsenceTemplate,
  rejectAbsenceTemplate,
  payslipDisbursedTemplate,
};
