type LoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

// Simple image loader - no CDN transformations
export default function imageLoader({ src }: LoaderProps) {
  return src;
}
