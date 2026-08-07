import { hrisApi } from '@/api/hris';
import { type DocumentsAcl } from '@/api/hris/company/model/acl';

export function documentsAcl(): DocumentsAcl {
  const uploadCompanyLogo = async (logo: File) => {
    const api = hrisApi;

    return api.documents.uploadFile('supabase-storage', logo, 'photos');
  };

  const deleteCompanyLogo = async (logoPath: string) => {
    const api = hrisApi;

    return api.documents.deleteFileByFilePath('supabase-storage', logoPath);
  };

  return {
    uploadCompanyLogo,
    deleteCompanyLogo,
  };
}
