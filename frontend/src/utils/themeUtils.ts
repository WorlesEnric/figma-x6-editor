import type { Graph } from '@antv/x6'

export function applyThemeClass(theme: 'dark' | 'light') {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('theme-light')
  } else {
    root.classList.remove('theme-light')
  }
}

export function redrawGridForTheme(graph: Graph) {
  const styles = getComputedStyle(document.documentElement)
  const isLight = document.documentElement.classList.contains('theme-light')
  const gridColor = styles.getPropertyValue('--color-canvas-grid').trim() || (isLight ? '#d0d0d0' : '#2a2a2a')
  
  try {
    // @ts-ignore X6 has drawGrid available at runtime
    if (typeof (graph as any).drawGrid === 'function') {
      ; (graph as any).drawGrid({
        type: 'doubleMesh',
        size: 10,
        args: [
          { color: gridColor, thickness: 1 },
          { color: gridColor, thickness: 1, factor: 4 },
        ],
      })
    }
  } catch { }

  const canvasColor = styles.getPropertyValue('--color-canvas').trim() || (isLight ? '#ffffff' : '#1a1a1a')
  graph.container.style.backgroundColor = canvasColor

  // Sync X6 internal background
  graph.drawBackground({ color: canvasColor })
}

export function ensureGridVisible(graph: Graph) {
  redrawGridForTheme(graph)
  graph.showGrid()
}
