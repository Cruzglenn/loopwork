'use server';

import { revalidatePath } from 'next/cache';
import { hrisApi } from '@/api/hris';
import { type CUID, handleActionError, HRIS_ROUTES, type Nullable } from '@/shared';
import { DOCUMENTS_ERRORS } from '@/api/hris/documents/errors';
import { logger } from '@/shared/service/pino';
import { type AddDocumentSchema } from '../_schemas/add-document.schema';
import { type AddDocumentState } from './types';

export async function addDocument(
  prevState: AddDocumentState,
  formData: FormData,
): Promise<AddDocumentState> {
  const api = hrisApi;

  // Filter out empty file input entries (name === '' or size === 0)
  const rawDocuments = formData.getAll('documents') as File[];
  const documents = rawDocuments.filter(
    (file) => file && typeof file.name === 'string' && file.name.trim().length > 0 && file.size > 0,
  );

  const form: AddDocumentSchema = {
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    expirationDate: formData.get('expirationDate') as string,
    documents,
  };

  try {
    if (!form.documents.length) {
      return {
        ...prevState,
        status: 'validation-error',
        errors: { documents: [DOCUMENTS_ERRORS.NOT_ATTACHED] },
      };
    }

    const { description, expirationDate } = form;
    const categoryValue = form.category?.trim() || null;
    const expirationDateValue = expirationDate ? new Date(expirationDate) : null;

    // For multiple files, use empty description; for single file, use description or fallback to filename
    const getFileDescription = (index: number) => {
      if (documents.length > 1) return '';
      const trimmedDescription = description?.trim();
      return trimmedDescription || documents[index]?.name || '';
    };

    let categoryId: Nullable<CUID> = null;
    if (categoryValue) {
      // Check if the value is a CUID (existing category ID from dropdown)
      const isCUID = /^c[a-z0-9]{18,25}$/.test(categoryValue);

      if (isCUID) {
        categoryId = categoryValue;
      } else {
        // It's a new or custom category name - search for existing category by name first
        try {
          const searchResults = await api.documents.getAllCategories(categoryValue, undefined, 'all');
          const existingCategory = searchResults.items.find(
            (cat) => cat.name.toLowerCase() === categoryValue.toLowerCase(),
          );

          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            categoryId = await api.documents.createDocumentCategory(categoryValue);
          }
        } catch (err) {
          logger.error(err, 'Failed to resolve or create document category');
          return {
            ...prevState,
            ...handleActionError(err),
          };
        }
      }
    }

    const docIds = await api.documents.uploadDocuments(documents, 'documents');

    await Promise.all(
      docIds.map((id, index) =>
        api.documents.updateDocument(id, {
          description: getFileDescription(index),
          expDate: expirationDateValue,
          categoryId,
        }),
      ),
    );

    revalidatePath(HRIS_ROUTES.documents.base);

    return {
      ...prevState,
      data: undefined,
      status: 'success',
    };
  } catch (err) {
    logger.error(err, 'Error executing addDocument action');

    return {
      ...prevState,
      form: {
        ...prevState.form,
      },
      ...handleActionError(err),
    };
  }
}
