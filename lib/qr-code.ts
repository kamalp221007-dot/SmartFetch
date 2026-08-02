// Simple QR Code generator using SVG
// This creates a visual QR-like code pattern based on the input data

function hashString(str: string): number[] {
  const hash: number[] = []
  for (let i = 0; i < str.length; i++) {
    hash.push(str.charCodeAt(i))
  }
  return hash
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateQRCodeSVG(data: string, size: number = 200, color: string = "#000000"): string {
  const gridSize = 21
  const cellSize = size / gridSize
  const hash = hashString(data)
  const seed = hash.reduce((a, b) => a + b, 0)
  const random = seededRandom(seed)

  let cells = ""

  // Fixed finder patterns (top-left, top-right, bottom-left)
  const finderPositions = [
    { x: 0, y: 0 },
    { x: gridSize - 7, y: 0 },
    { x: 0, y: gridSize - 7 },
  ]

  const isFinderCell = (x: number, y: number): boolean => {
    for (const fp of finderPositions) {
      const rx = x - fp.x
      const ry = y - fp.y
      if (rx >= 0 && rx < 7 && ry >= 0 && ry < 7) {
        // Outer border
        if (rx === 0 || rx === 6 || ry === 0 || ry === 6) return true
        // Inner square
        if (rx >= 2 && rx <= 4 && ry >= 2 && ry <= 4) return true
        return false
      }
    }
    return false
  }

  const isFinderArea = (x: number, y: number): boolean => {
    for (const fp of finderPositions) {
      if (x >= fp.x && x < fp.x + 7 && y >= fp.y && y < fp.y + 7) return true
    }
    return false
  }

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let filled = false

      if (isFinderArea(x, y)) {
        filled = isFinderCell(x, y)
      } else {
        // Use data-driven pattern
        const dataIndex = (y * gridSize + x) % data.length
        const charCode = data.charCodeAt(dataIndex)
        const r = random()
        filled = r < 0.4 + (charCode % 20) / 100
      }

      if (filled) {
        cells += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" />`
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="white" />
    ${cells}
  </svg>`
}
