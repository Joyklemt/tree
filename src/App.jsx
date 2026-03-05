import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import IntroScreen from './components/IntroScreen'
import FileTreeVisualizer from './components/FileTreeVisualizer'

export default function App() {
  const [phase, setPhase] = useState('intro')

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {phase === 'intro' ? (
          <IntroScreen key="intro" onEnter={() => setPhase('tree')} />
        ) : (
          <FileTreeVisualizer key="tree" onBack={() => setPhase('intro')} />
        )}
      </AnimatePresence>
    </div>
  )
}
