import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <Link href="/" className={`flex items-center gap-3 hover:scale-105 transition-all duration-200 group ${className}`}>
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gradient-to-r from-purple-500 to-pink-500 shadow-lg group-hover:shadow-purple-500/25 group-hover:shadow-xl transition-all duration-300`}>
        <Image
          src="/iopn-logo.png"
          alt="IOPN Logo"
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300">
          IOPN
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
          Platform
        </span>
      </div>
    </Link>
  );
}