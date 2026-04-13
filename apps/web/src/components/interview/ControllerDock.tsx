import { Mic, MicOff, Volume2, VolumeX, RefreshCw, PhoneOff, MoreVertical, ClosedCaption, PauseCircle, Activity } from 'lucide-react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel
} from '@repo/ui';
import { Dispatch, SetStateAction } from 'react';

interface InterviewDockProps {
  isMicOn: boolean;
  setIsMicOn: Dispatch<SetStateAction<boolean>>;
  isAudioOn: boolean;
  setIsAudioOn: Dispatch<SetStateAction<boolean>>;
  isCaptionOn: boolean;
  setIsCaptionOn: Dispatch<SetStateAction<boolean>>;
  selectedMic: string;
  setSelectedMic: Dispatch<SetStateAction<string>>;
  selectedSpeaker: string;
  setSelectedSpeaker: Dispatch<SetStateAction<string>>;
  mics?: string[];
  speakers?: string[];
  onEndInterview?: () => void;
}

export function ControllerDock({
  isMicOn,
  setIsMicOn,
  isAudioOn,
  setIsAudioOn,
  isCaptionOn,
  setIsCaptionOn,
  selectedMic,
  setSelectedMic,
  selectedSpeaker,
  setSelectedSpeaker,
  mics = ["Default Microphone", "MacBook Pro Microphone", "AirPods Pro"],
  speakers = ["Default Speaker", "MacBook Pro Speakers", "AirPods Pro"],
  onEndInterview
}: InterviewDockProps) {
  return (
    <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pb-safe pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-background/80 px-6 py-3 shadow-2xl backdrop-blur-xl ring-1 ring-border/10">

        {/* Mic Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isMicOn ? "secondary" : "destructive"}
                size="icon"
                className={`h-14 w-14 rounded-full transition-all duration-300 cursor-pointer ${isMicOn ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground' : ''}`}
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Audio Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-14 w-14 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer ${!isAudioOn ? 'text-destructive hover:text-destructive' : ''}`}
                onClick={() => setIsAudioOn(!isAudioOn)}
              >
                {isAudioOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{isAudioOn ? 'Mute Audio' : 'Unmute Audio'}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Transcripts */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-14 w-14 rounded-full transition-colors cursor-pointer ${isCaptionOn ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                onClick={() => setIsCaptionOn(!isCaptionOn)}
              >
                <ClosedCaption className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Transcripts</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Break */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent">
                <PauseCircle className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Take a Break</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Repeat */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent">
                <RefreshCw className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Repeat Question</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* More Options / Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent">
              <MoreVertical className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64 bg-popover border-border text-popover-foreground">
            <DropdownMenuLabel>Device Settings</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Mic className="mr-2 h-4 w-4" /> Microphone
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border-border text-popover-foreground">
                <DropdownMenuRadioGroup value={selectedMic} onValueChange={setSelectedMic}>
                  {mics.map(mic => (
                    <DropdownMenuRadioItem key={mic} value={mic} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      {mic}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Volume2 className="mr-2 h-4 w-4" /> Speaker
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border-border text-popover-foreground">
                <DropdownMenuRadioGroup value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                  {speakers.map(spk => (
                    <DropdownMenuRadioItem key={spk} value={spk} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      {spk}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" /> Reconnect
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
              <Activity className="mr-2 h-4 w-4" /> Re-sync transcript
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
              <span className="text-xs text-muted-foreground">I didn&apos;t hear that</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* End Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-28 rounded-full hover:bg-destructive/90 shadow-none cursor-pointer"
                onClick={onEndInterview}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>End Interview</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>
    </div>
  );
}
