import { Camera, CameraOff, Video } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { AppCard as Card } from "@/components/ui/AppCard";
import { AppBadge as Badge } from "@/components/ui/AppBadge";
import type { RefObject } from "react";

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  overlayRef?: RefObject<HTMLCanvasElement | null>;
  active: boolean;
  fps: number;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  starting?: boolean;
  handsDetected?: number;
}

export function WebcamFeed({ videoRef, overlayRef, active, fps, error, onStart, onStop, starting, handsDetected = 0 }: Props) {
  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-[#F97316]" />
          <h3 className="text-sm font-semibold text-white">Live Webcam</h3>
        </div>
        <Badge tone={active ? "success" : "muted"}>
          {active ? `${fps} FPS` : "-- FPS"}
        </Badge>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10">
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className="h-full w-full object-cover scale-x-[-1]"
        />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 h-full w-full pointer-events-none scale-x-[-1]"
        />
        {active && handsDetected > 0 && (
          <div className="absolute top-3 right-3 rounded-full bg-[#F97316]/90 backdrop-blur px-2.5 py-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white">
              {handsDetected} {handsDetected === 1 ? "Hand" : "Hands"}
            </span>
          </div>
        )}
        {!active && (
          <div className="absolute inset-0 grid place-items-center text-center px-4">
            <div className="space-y-2">
              <CameraOff className="h-8 w-8 text-white/30 mx-auto" />
              <p className="text-sm text-white/50">Camera is off</p>
              {error && <p className="text-xs text-red-400 max-w-xs">{error}</p>}
            </div>
          </div>
        )}
        {active && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-white">Live</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {active ? (
          <Button variant="danger" className="flex-1" onClick={onStop}>
            <CameraOff className="h-4 w-4" /> Stop Camera
          </Button>
        ) : (
          <Button variant="primary" className="flex-1" loading={starting} onClick={onStart}>
            <Camera className="h-4 w-4" /> Start Camera
          </Button>
        )}
      </div>
    </Card>
  );
}
