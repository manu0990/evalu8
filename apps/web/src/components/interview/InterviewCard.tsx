import { cn } from "@repo/ui/lib/utils";
import { Zap } from "lucide-react";
import Image from "next/image";
import { VoiceVisualizer } from "./MicVisualizer";

interface InterviewCardProps {
  type: 'user' | 'ai';
  imageSrc?: string;
  isSpeaking?: boolean;
  className?: string;
  stream?: MediaStream | null;
}

export function InterviewCard({ type, imageSrc, isSpeaking = false, className, stream }: InterviewCardProps) {
  const isAI = type === 'ai';
  const label = isAI ? "Evalu8" : "You";

  return (
    <div className={cn(
      "relative flex items-center justify-center overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all duration-300",
      // Subtle glow effect
      "hover:ring-1 hover:ring-primary/50 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.3)]",
      // Active speaking glow (optional enhancement)
      isSpeaking && "ring-1 ring-primary/50 shadow-[0_0_30px_-10px_rgba(var(--primary),0.4)]",
      className
    )}>
      {/* Ambient Background Gradient (Subtle) */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-tr opacity-20 transition-opacity duration-1000",
        isAI ? "from-primary/20 via-transparent to-accent/20" : "from-secondary/20 via-transparent to-muted/20"
      )} />

      {/* Central Circular Image/Avatar */}
      <div className={cn(
        "relative z-10 flex h-48 w-48 items-center justify-center rounded-full border-4 shadow-inner overflow-hidden",
        isAI ? "border-primary/20 bg-muted" : "border-border bg-muted"
      )}>
        {imageSrc ? (
          <Image src={imageSrc} alt={label} className="h-full w-full object-cover" />
        ) : (
          isAI ? (
            <Zap className="h-16 w-16 text-primary animate-pulse" />
          ) : (
            stream ? (
              <div className="text-sm text-muted-foreground">User</div>
            ) : (
              <div className="text-sm text-muted-foreground">User</div>
            )
          )
        )}
      </div>

      {/* Bottom Left Label with Visualizer */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="flex items-center gap-2 rounded-lg border border-border/10 bg-background/80 px-3 py-1.5 backdrop-blur-md">
          <span className="text-xs font-medium text-foreground">{label}</span>
          <VoiceVisualizer isSpeaking={isSpeaking} stream={stream} />
        </div>
      </div>
    </div>
  );
}
