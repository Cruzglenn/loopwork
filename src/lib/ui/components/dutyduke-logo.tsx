import Image from 'next/image';
import { cn, type PropsWithClassName } from '@/shared';

type Props = {
  height?: number;
  variant?: 'default' | 'small' | 'large' | 'icon';
  imgClassName?: string;
};

export function DutydukeLogo({
  className,
  imgClassName,
  height = 24,
  variant = 'default',
}: PropsWithClassName<Props>): JSX.Element {
  let logoSrc = '/images/logo.png';
  let defaultWidth = 124;

  if (variant === 'small') {
    logoSrc = '/images/logo-sm.png';
    defaultWidth = 100;
  } else if (variant === 'large') {
    logoSrc = '/images/logo-lg.png';
    defaultWidth = 200;
  } else if (variant === 'icon') {
    logoSrc = '/images/logo-icon.png';
    defaultWidth = 24;
  }

  return (
    <span aria-hidden="true" className={cn('flex items-center justify-center', className)}>
      <picture>
        <source srcSet={`${logoSrc.replace('.png', '.webp')}`} type="image/webp" />
        <Image
          priority
          alt="DutyDuke HRIS"
          className={cn('h-5.5 w-auto object-contain md:h-6', imgClassName)}
          draggable={false}
          height={height}
          src={logoSrc}
          width={defaultWidth}
        />
      </picture>
    </span>
  );
}

export const LoopworkLogo = DutydukeLogo;
