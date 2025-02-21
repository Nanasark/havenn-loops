"use client"

interface ControlsProps {
  tempo: number
  pitch: number
  onTempoChange: (value: number) => void
  onPitchChange: (value: number) => void
}

export default function Controls({ tempo, pitch, onTempoChange, onPitchChange }: ControlsProps) {
  const handleTempoChange = (delta: number) => {
    onTempoChange(Math.max(50, Math.min(200, tempo + delta)))
  }

  const handlePitchChange = (delta: number) => {
    onPitchChange(Math.max(50, Math.min(200, pitch + delta)))
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600">Tempo: {tempo}%</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleTempoChange(-1)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            -
          </button>
          <button
            onClick={() => handleTempoChange(1)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600">Pitch: {pitch}%</span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePitchChange(-1)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            -
          </button>
          <button
            onClick={() => handlePitchChange(1)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

