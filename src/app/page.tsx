"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import * as Tone from "tone"
import { Music, Plus, Minus } from "lucide-react"
import PushNotificationManager from "../components/PushNotificationManager"
import InstallPrompt from "../components/InstallPrompt"

export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(100)
  const [pitch, setPitch] = useState(100)
  const [isLoaded, setIsLoaded] = useState(false)
  const playerRef = useRef<Tone.Player | null>(null)
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (audioUrl) {
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
    }
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

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

  const handleTempoChange = (delta: number) => {
    setTempo(Math.max(50, Math.min(200, tempo + delta)))
  }

  const handlePitchChange = (delta: number) => {
    setPitch(Math.max(50, Math.min(200, pitch + delta)))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold text-center">Musical Loop App</h1>
        </div>
        <div className="p-4 space-y-6">
          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          <button
            onClick={triggerFileInput}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <Music className="mr-2" /> Add Music
          </button>
          {audioUrl && (
            <>
              <div className="flex justify-center">
                <button
                  onClick={togglePlayPause}
                  disabled={!isLoaded}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tempo: {tempo}%</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTempoChange(-1)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      onClick={() => handleTempoChange(1)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pitch: {pitch}%</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePitchChange(-1)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      onClick={() => handlePitchChange(1)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-8">
        <PushNotificationManager />
        <InstallPrompt />
      </div>
    </main>
  )
}

