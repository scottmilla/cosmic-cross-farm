import { CanvasTexture, SRGBColorSpace } from 'three'

export interface CarvedLine {
  text: string
  font: string // CSS font shorthand, e.g. '120px Fondamento, cursive'
  y: number
}

// Text that reads as hand-chiselled into wood: letters are placed one at a time with a little wobble in
// rotation and baseline (a carver's hand is never ruled), cut as a dark groove with a light lip on the
// lower edge, plus a bump map so the scene lighting catches the groove.
export function carvedTextures(width: number, height: number, lines: CarvedLine[]) {
  const mk = () => {
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    return { c, ctx: c.getContext('2d')! }
  }
  const color = mk()
  const bump = mk()
  const map = new CanvasTexture(color.c)
  map.colorSpace = SRGBColorSpace
  const bumpMap = new CanvasTexture(bump.c)

  function stamp(ctx: CanvasRenderingContext2D, l: CarvedLine, style: string, dx: number, dy: number) {
    ctx.font = l.font
    ctx.fillStyle = style
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const chars = [...l.text]
    const widths = chars.map((ch) => ctx.measureText(ch).width)
    let x = (width - widths.reduce((a, b) => a + b, 0)) / 2
    chars.forEach((ch, i) => {
      const w = widths[i]!
      ctx.save()
      ctx.translate(x + w / 2 + dx, l.y + dy + Math.sin(i * 2.1) * 3)
      ctx.rotate(Math.sin(i * 1.7 + 0.5) * 0.045)
      ctx.fillText(ch, -w / 2, 0)
      ctx.restore()
      x += w
    })
  }

  function draw() {
    color.ctx.clearRect(0, 0, width, height)
    bump.ctx.filter = 'none'
    bump.ctx.fillStyle = '#ffffff'
    bump.ctx.fillRect(0, 0, width, height)
    bump.ctx.filter = 'blur(2px)'
    for (const l of lines) {
      stamp(color.ctx, l, 'rgba(236, 188, 120, 0.75)', 2, 3) // lit lower lip
      stamp(color.ctx, l, 'rgba(40, 22, 10, 0.92)', 0, 0) // the cut
      stamp(color.ctx, l, 'rgba(15, 8, 3, 0.55)', -1, -1.5) // shadowed upper wall
      stamp(color.ctx, l, 'rgba(58, 34, 16, 0.95)', 1, 1)
      stamp(bump.ctx, l, '#000000', 0, 0)
    }
    map.needsUpdate = true
    bumpMap.needsUpdate = true
  }

  draw()
  // redraw once the web font has actually loaded
  Promise.all(lines.map((l) => document.fonts.load(l.font, l.text))).then(draw).catch(() => {})
  return { map, bumpMap }
}
