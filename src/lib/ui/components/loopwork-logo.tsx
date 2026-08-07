import Image from 'next/image';
import { cn, type PropsWithClassName } from '@/shared';

type Props = {
  height?: number;
};

export function LoopworkLogo({ className, height = 32 }: PropsWithClassName<Props>): JSX.Element {
  return (
    <span aria-hidden="true" className={cn('flex items-center justify-center', className)}>
      <Image
        alt="Loopwork"
        className="h-7 w-auto object-contain"
        draggable={false}
        height={height}
        src="/images/logo.svg"
        width={120}
      />
    </span>
  );
}
