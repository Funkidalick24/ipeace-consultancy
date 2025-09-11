import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Hook to detect user's motion preferences
const useMotionPreference = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Basic Spinner Component
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}

export const Spinner = ({
  size = "md",
  className,
  "aria-label": ariaLabel = "Loading"
}: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      aria-label={ariaLabel}
      role="status"
    />
  );
};

// Page Loader Component
interface PageLoaderProps {
  message?: string;
  variant?: "spinner" | "logo" | "progress";
  className?: string;
}

export const PageLoader = ({
  message = "Loading...",
  variant = "spinner",
  className
}: PageLoaderProps) => {
  const prefersReducedMotion = useMotionPreference();

  if (variant === "logo") {
    return (
      <div
        className={cn("flex flex-col items-center justify-center min-h-screen space-y-4", className)}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <motion.img
          src="/logo.png"
          alt="LegalDocConnect Logo"
          className="h-12 w-12"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    );
  }

  if (variant === "progress") {
    return (
      <div
        className={cn("flex flex-col items-center justify-center min-h-screen space-y-4", className)}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={prefersReducedMotion ? { width: "100%" } : { width: "100%" }}
            transition={{
              duration: prefersReducedMotion ? 0.5 : 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center min-h-screen", className)}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center space-y-2">
        <Spinner size="lg" aria-label={message} />
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    </div>
  );
};

// Inline Loader Component
interface InlineLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const InlineLoader = ({ size = "sm", className }: InlineLoaderProps) => (
  <Spinner size={size} className={className} />
);

// Button Loader Component
interface ButtonLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonLoader = ({
  loading,
  children,
  loadingText = "Loading...",
  className,
  disabled = false,
  onClick
}: ButtonLoaderProps) => (
  <button
    className={cn("flex items-center space-x-2", className)}
    disabled={disabled || loading}
    onClick={onClick}
  >
    {loading && <Spinner size="sm" />}
    <span>{loading ? loadingText : children}</span>
  </button>
);

// Bouncing Dots Animation
export const BouncingDots = ({ className }: { className?: string }) => {
  const prefersReducedMotion = useMotionPreference();

  return (
    <div
      className={cn("flex space-x-2", className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-primary rounded-full"
          animate={prefersReducedMotion ? {} : {
            y: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Pulse Ring Animation
export const PulseRing = ({ className }: { className?: string }) => (
  <div className={cn("relative", className)}>
    <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
    <motion.div
      className="absolute top-0 left-0 w-12 h-12 border-4 border-primary rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </div>
);

// Rotating Refresh Icon
export const RotatingRefresh = ({ className }: { className?: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    <RefreshCw className={cn("h-6 w-6", className)} />
  </motion.div>
);

// Wave Animation
export const WaveLoader = ({ className }: { className?: string }) => (
  <div className={cn("flex space-x-1", className)}>
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="w-1 bg-primary rounded-full"
        animate={{
          height: [4, 16, 4],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Orbiting Dots
export const OrbitingDots = ({ className }: { className?: string }) => (
  <div className={cn("relative w-12 h-12", className)}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-primary rounded-full"
        animate={{
          x: [0, 20, 0, -20, 0],
          y: [0, 0, 20, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "easeInOut"
        }}
        style={{
          top: '50%',
          left: '50%',
          marginTop: '-4px',
          marginLeft: '-4px',
        }}
      />
    ))}
  </div>
);

// Pulsing Circle
export const PulsingCircle = ({ className }: { className?: string }) => (
  <div className={cn("relative", className)}>
    <motion.div
      className="w-12 h-12 border-4 border-primary/30 rounded-full"
      animate={{
        scale: [1, 1.2, 1],
        borderWidth: [4, 2, 4]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute inset-0 w-12 h-12 border-4 border-primary rounded-full"
      animate={{
        scale: [0.8, 1.4, 0.8],
        opacity: [1, 0, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </div>
);

// Typing Animation
export const TypingAnimation = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center space-x-1", className)}>
    <span className="text-sm">Loading</span>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="text-primary"
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut"
        }}
      >
        .
      </motion.span>
    ))}
  </div>
);

// Spinning Rings
export const SpinningRings = ({ className }: { className?: string }) => (
  <div className={cn("relative w-12 h-12", className)}>
    <motion.div
      className="absolute inset-0 border-2 border-primary/20 rounded-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <motion.div
      className="absolute inset-2 border-2 border-primary rounded-full"
      animate={{ rotate: -360 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <motion.div
      className="absolute inset-4 border-2 border-primary/60 rounded-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </div>
);

// Skeleton Components
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
    <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
    <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
    <div className="h-32 bg-muted animate-pulse rounded"></div>
  </div>
);

export const ListSkeleton = ({ count = 5, className }: { count?: number; className?: string }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <div className="h-12 w-12 bg-muted animate-pulse rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export const TextSkeleton = ({
  lines = 3,
  className
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-muted animate-pulse rounded"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
);

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export const LoadingOverlay = ({
  isLoading,
  children,
  message = "Loading...",
  className
}: LoadingOverlayProps) => (
  <div className={cn("relative", className)}>
    {children}
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div className="flex flex-col items-center space-y-2">
          <Spinner size="lg" />
          <div className="text-sm text-muted-foreground">{message}</div>
        </div>
      </motion.div>
    )}
  </div>
);