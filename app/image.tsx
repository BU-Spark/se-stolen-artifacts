import NextImage, { ImageProps } from 'next/image';

interface CustomImageProps extends Omit<ImageProps, 'src'> {
  src?: string;
  className?: string;
}

export default function Image({ src = '', alt = '', className, ...props }: CustomImageProps) {
  // If no src provided, render a placeholder div
  if (!src) {
    return <div className={className} style={{ background: '#e5e7eb' }} />;
  }

  return <NextImage src={src} alt={alt} className={className} {...props} />;
}
