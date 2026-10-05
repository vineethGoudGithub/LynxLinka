import { motion } from 'framer-motion';

export default function GlowButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  disabled = false,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variants = {
    primary:
      'bg-neutral-900 text-white border border-neutral-800 hover:bg-black hover:shadow-md hover:shadow-neutral-900/15',
    emerald:
      'bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20 active:bg-emerald-700',
    secondary:
      'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400',
    ghost:
      'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        relative font-grotesk font-semibold rounded-xl
        transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]} ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
