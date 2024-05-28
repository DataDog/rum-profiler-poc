import { initRumProfiler } from '../src/main'
import { createRoot } from 'react-dom/client'
import React from 'react'
import { Counter } from './components/Counter'
import { HeavyComputation } from './components/HeavyComputation'

initRumProfiler({
  applicationId: import.meta.env.VITE_APPLICATION_ID,
  clientToken: import.meta.env.VITE_CLIENT_TOKEN,
  service: import.meta.env.VITE_SERVICE,
  version: import.meta.env.VITE_VERSION,
  env: import.meta.env.VITE_ENV,
  site: import.meta.env.VITE_SITE,
})

const root = createRoot(document.getElementById('app')!)
root.render(
  <>
    <section>
      <Counter />
    </section>
    <section>
      <HeavyComputation />
    </section>
  </>
)
