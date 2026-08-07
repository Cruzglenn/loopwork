import { type PropsWithChildren } from 'react';
import { cn, type PropsWithClassName } from '@/shared';
import { type Api } from '@/api/hris';
import { LoopworkLogo } from './loopwork-logo';

type Props = {
  api: Api;
};

export async function Header({ children, className }: PropsWithClassName<PropsWithChildren<Props>>) {
  return (
    <header
      className={cn(
        'sticky left-0 top-0 z-[60] flex h-14 items-center rounded-b-xl bg-white px-4 shadow-xs md:rounded-none',
        className,
      )}
    >
      <div className="flex w-full max-w-[102rem] items-center justify-between">
        <div className="flex items-center">
          <LoopworkLogo />
        </div>
        <div className="ml-auto flex items-center gap-x-3">{children}</div>
      </div>
    </header>
  );
}
