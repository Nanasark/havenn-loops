"use client"

import { useRef, useState, useEffect } from "react"
import * as Tone from "tone"
import Visualizer from "./Visualizer"

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
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    const setupAudio = async () => {
      await Tone.start()
      playerRef.current = new Tone.Player(audioUrl)
      pitchShiftRef.current = new Tone.PitchShift()

      // Create AnalyserNode
      const analyser = Tone.getContext().createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser

      playerRef.current.chain(pitchShiftRef.current, analyser, Tone.Destination)

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
    <div className="flex flex-col items-center mt-4 space-y-4">
      <Visualizer analyser={analyserRef.current} />
      <button
        onClick={togglePlayPause}
        disabled={!isLoaded}
        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  )
}

