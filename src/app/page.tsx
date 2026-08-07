import { redirect } from 'next/navigation';
import { HRIS_ROUTES } from '@/shared';

export default function Home() {
  redirect(HRIS_ROUTES.employees.base);
}
