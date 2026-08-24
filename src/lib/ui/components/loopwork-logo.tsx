import Image from 'next/image';
import { cn, type PropsWithClassName } from '@/shared';

type Props = {
  height?: number;
  variant?: 'default' | 'small' | 'large' | 'icon';
  imgClassName?: string;
};

export function LoopworkLogo({
  className,
  imgClassName,
  height,
  variant = 'default',
}: PropsWithClassName<Props>): JSX.Element {
  let logoSrc = '/images/logo.png';
  let defaultWidth = 124;
  let defaultHeight = 24;
  let defaultImgClass = 'h-6 w-auto max-h-6 max-w-full object-contain md:h-6';

  if (variant === 'small') {
    logoSrc = '/images/logo-sm.png';
    defaultWidth = 100;
    defaultHeight = 20;
    defaultImgClass = 'h-5 w-auto max-h-5 max-w-full object-contain';
  } else if (variant === 'large') {
    logoSrc = '/images/logo-lg.png';
    defaultWidth = 200;
    defaultHeight = 40;
    defaultImgClass = 'h-8 sm:h-10 md:h-11 w-auto max-h-12 max-w-full object-contain';
  } else if (variant === 'icon') {
    logoSrc = '/images/logo-icon.png';
    defaultWidth = 24;
    defaultHeight = 24;
    defaultImgClass = 'h-6 w-6 object-contain';
  }

  const renderHeight = height ?? defaultHeight;

  return (
    <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center', className)}>
      <picture className="inline-flex items-center justify-center">
        <source srcSet={`${logoSrc.replace('.png', '.webp')}`} type="image/webp" />
        <Image
          priority
          alt="Loopwork HRIS"
          className={cn(defaultImgClass, imgClassName)}
          draggable={false}
          height={renderHeight}
          src={logoSrc}
          width={defaultWidth}
        />
      </picture>
    </span>
  );
}

export const DutydukeLogo = LoopworkLogo;
