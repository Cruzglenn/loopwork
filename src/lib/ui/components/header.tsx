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
        'flex h-14 w-full shrink-0 items-center rounded-b-xl bg-white px-4 shadow-xs md:rounded-none z-[60]',
        className,
      )}
    >
      <div className="flex w-full max-w-[102rem] items-center justify-between">
        <div className="flex shrink-0 items-center gap-x-3">
          <LoopworkLogo height={24} variant="default" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-x-3">{children}</div>
      </div>
    </header>
  );
}
