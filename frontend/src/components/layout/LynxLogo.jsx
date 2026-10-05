export default function LynxLogo({ className = "w-8 h-8", showText = false, textClassName = "text-lg" }) {
  return (
    <div className="flex items-center gap-2.5 group select-none">
      <div className={`relative ${className} flex-shrink-0 flex items-center justify-center`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-sm group-hover:bg-emerald-500/35 transition-all duration-300" />
        
        {/* Logo icon container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-emerald-400/50 transition-colors">
          <img 
            src="/lynxlink.png" 
            alt="LynxLink" 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'block';
            }} 
          />
          {/* Fallback SVG */}
          <svg
            style={{ display: 'none' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-emerald-400"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-grotesk font-bold tracking-tight text-neutral-900 leading-none ${textClassName}`}>
            Lynx<span className="text-emerald-600">Link</span>
          </span>
          <span className="text-[9px] font-mono tracking-wider text-emerald-600 uppercase font-semibold">
            Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
