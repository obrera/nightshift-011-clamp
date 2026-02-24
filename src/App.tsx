import { useMemo, useState } from 'react'
import './App.css'

type Preset = {
  name: string
  minViewport: number
  maxViewport: number
  minSize: number
  maxSize: number
}

const PRESETS: Preset[] = [
  { name: 'Body text', minViewport: 320, maxViewport: 1280, minSize: 16, maxSize: 20 },
  { name: 'Heading', minViewport: 320, maxViewport: 1440, minSize: 28, maxSize: 56 },
  { name: 'Display', minViewport: 375, maxViewport: 1600, minSize: 42, maxSize: 96 },
]

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function App() {
  const [minViewport, setMinViewport] = useState(320)
  const [maxViewport, setMaxViewport] = useState(1280)
  const [minSize, setMinSize] = useState(16)
  const [maxSize, setMaxSize] = useState(42)
  const [previewWidth, setPreviewWidth] = useState(768)
  const [copied, setCopied] = useState(false)

  const formula = useMemo(() => {
    if (maxViewport <= minViewport || maxSize < minSize) {
      return { css: 'Invalid range', px: minSize }
    }

    const slope = ((maxSize - minSize) / (maxViewport - minViewport)) * 100
    const intercept = minSize - (slope * minViewport) / 100
    const preferred = `${intercept.toFixed(4)}px + ${slope.toFixed(4)}vw`
    const css = `clamp(${minSize}px, ${preferred}, ${maxSize}px)`

    const width = clampValue(previewWidth, minViewport, maxViewport)
    const px = intercept + (slope * width) / 100

    return { css, px }
  }, [maxSize, maxViewport, minSize, minViewport, previewWidth])

  const applyPreset = (preset: Preset) => {
    setMinViewport(preset.minViewport)
    setMaxViewport(preset.maxViewport)
    setMinSize(preset.minSize)
    setMaxSize(preset.maxSize)
    setPreviewWidth(clampValue(previewWidth, preset.minViewport, preset.maxViewport))
  }

  const copyCss = async () => {
    if (formula.css === 'Invalid range') return
    await navigator.clipboard.writeText(formula.css)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="app">
      <header>
        <h1>Clamp Craft</h1>
        <p>Generate responsive CSS clamp() values for fluid typography in seconds.</p>
      </header>

      <section className="panel controls">
        <h2>Inputs</h2>
        <div className="grid">
          <label>
            Min viewport (px)
            <input type="number" value={minViewport} onChange={(e) => setMinViewport(Number(e.target.value))} />
          </label>
          <label>
            Max viewport (px)
            <input type="number" value={maxViewport} onChange={(e) => setMaxViewport(Number(e.target.value))} />
          </label>
          <label>
            Min font size (px)
            <input type="number" value={minSize} onChange={(e) => setMinSize(Number(e.target.value))} />
          </label>
          <label>
            Max font size (px)
            <input type="number" value={maxSize} onChange={(e) => setMaxSize(Number(e.target.value))} />
          </label>
        </div>

        <div className="presets">
          {PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => applyPreset(preset)}>
              {preset.name}
            </button>
          ))}
        </div>
      </section>

      <section className="panel output">
        <h2>Output</h2>
        <code>{formula.css}</code>
        <button className="copy" onClick={copyCss} disabled={formula.css === 'Invalid range'}>
          {copied ? 'Copied!' : 'Copy CSS'}
        </button>
      </section>

      <section className="panel preview">
        <h2>Preview</h2>
        <label>
          Preview width: {previewWidth}px
          <input
            type="range"
            min={Math.max(200, minViewport - 200)}
            max={maxViewport + 200}
            value={previewWidth}
            onChange={(e) => setPreviewWidth(Number(e.target.value))}
          />
        </label>
        <p style={{ fontSize: `${formula.px}px` }}>
          The quick brown fox jumps over the lazy dog ({formula.px.toFixed(2)}px)
        </p>
      </section>
    </main>
  )
}

export default App
