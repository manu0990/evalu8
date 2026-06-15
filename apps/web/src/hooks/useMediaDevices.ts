import { useState, useEffect } from 'react';

export interface MediaDeviceItem {
  id: string;
  label: string;
}

export function useMediaDevices() {
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [mics, setMics] = useState<MediaDeviceItem[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceItem[]>([]);

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices.filter(d => d.kind === 'audioinput').map(d => ({ id: d.deviceId, label: d.label || 'Microphone' }));
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput').map(d => ({ id: d.deviceId, label: d.label || 'Speaker' }));
        
        const uniqueMics = Array.from(new Map(audioInputs.map(item => [item.id, item])).values());
        const uniqueSpeakers = Array.from(new Map(audioOutputs.map(item => [item.id, item])).values());

        setMics(uniqueMics);
        setSpeakers(uniqueSpeakers);

        if (uniqueMics.length > 0) setSelectedMic(prev => prev || uniqueMics[0]?.id || "");
        if (uniqueSpeakers.length > 0) setSelectedSpeaker(prev => prev || uniqueSpeakers[0]?.id || "");
      } catch (err) {
        console.error("Failed to load devices", err);
      }
    }
    loadDevices();
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
  }, []);

  return {
    mics,
    speakers,
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker
  };
}
