// lib/plotly-types.d.ts
// Declares the global Plotly namespace used in react-plotly.js chart components.
// Without this, TypeScript cannot find Plotly.Data, Plotly.Layout, Plotly.Config.

import type { Data, Layout, Config } from 'plotly.js'

declare global {
  namespace Plotly {
    type Data   = import('plotly.js').Data
    type Layout = import('plotly.js').Layout
    type Config = import('plotly.js').Config
  }
}

export {}
