"use client"

import { useState } from "react"
import FileUpload from "../components/FileUpload"
import AudioPlayer from "../components/AudioPlayer"
import Controls from "../components/Controls"
import PushNotificationManager from "../components/PushNotificationManager"
import InstallPrompt from "../components/InstallPrompt"

export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [tempo, setTempo] = useState(100)
  const [pitch, setPitch] = useState(100)

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold text-center">Musical Loop App</h1>
        </div>
        <div className="p-4 space-y-6">
          <FileUpload onFileUpload={handleFileUpload} />
          {audioUrl && (
            <>
              <AudioPlayer audioUrl={audioUrl} tempo={tempo} pitch={pitch} />
              <Controls tempo={tempo} pitch={pitch} onTempoChange={setTempo} onPitchChange={setPitch} />
            </>
          )}
        </div>
      </div>
      <div className="mt-8 w-full max-w-md">
        <PushNotificationManager />
        <InstallPrompt />
      </div>
    </main>
  )
}

