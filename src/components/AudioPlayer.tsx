"use client"

import { useRef, useState, useEffect } from "react"
import * as Tone from "tone"
import { Play, Pause } from "lucide-react"

interface AudioPlayerProps {
  audioUrl: string
  tempo: number
  pitch: number
}

export default function AudioPlayer({ audioUrl, tempo, pitch }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const playerRef = useRef<Tone.Player | null>(null)
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null)

  useEffect(() => {
    const setupAudio = async () => {
      await Tone.start()
      playerRef.current = new Tone.Player(audioUrl)
      pitchShiftRef.current = new Tone.PitchShift()
      playerRef.current.chain(pitchShiftRef.current, Tone.Destination)
      playerRef.current.loop = true
      await playerRef.current.load(audioUrl)
      setIsLoaded(true)
    }
    setupAudio()
    return () => {
      playerRef.current?.dispose()
      pitchShiftRef.current?.dispose()
    }
  }, [audioUrl])

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate = tempo / 100
    }
  }, [tempo])

  useEffect(() => {
    if (pitchShiftRef.current) {
      pitchShiftRef.current.pitch = Math.log2(pitch / 100) * 12
    }
  }, [pitch])

  const togglePlayPause = async () => {
    if (!isLoaded) return
    if (isPlaying) {
      await Tone.Transport.stop()
      playerRef.current?.stop()
    } else {
      await Tone.start()
      playerRef.current?.start()
      Tone.Transport.start()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={togglePlayPause}
        disabled={!isLoaded}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
    </div>
  )
}

