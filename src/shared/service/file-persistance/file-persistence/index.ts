import { persistentVolumeService } from './persistent-volume.service';
import { supabaseStorageService } from './supabase-storage.service';

export type FilePersistenceType = 'persistent-volume' | 'supabase-storage';

export function filePersistenceFactory(type: FilePersistenceType = 'supabase-storage') {
  switch (type) {
    case 'supabase-storage':
      return supabaseStorageService();
    case 'persistent-volume':
    default:
      return persistentVolumeService();
  }
}
