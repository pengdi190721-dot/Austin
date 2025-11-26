import React from 'react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-banana-400 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 active:scale-95";
  
  const variants = {
    primary: "bg-banana-400 text-banana-950 hover:bg-banana-300 shadow-[0_0_20px_-5px_rgba(250,204,21,0.5)]",
    secondary: "bg-surfaceHighlight text-white hover:bg-zinc-700 border border-white/10",
    ghost: "hover:bg-white/10 text-zinc-300 hover:text-white",
    outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-md"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          处理中...
        </>
      ) : children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`rounded-xl border border-white/10 bg-surface/50 backdrop-blur-md text-zinc-100 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

// --- Input ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white transition-all ${className}`}
      {...props}
    />
  );
};

// --- Textarea ---
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => {
  return (
    <textarea 
      className={`flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white transition-all ${className}`}
      {...props}
    />
  );
};

// --- Meteor Effect Background ---
export const MeteorEffect = () => {
  const meteors = new Array(10).fill(true);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
       {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]" +
            " before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent"
          }
          style={{
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
        ></span>
      ))}
    </div>
  );
};