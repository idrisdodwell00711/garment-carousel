import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react'

type Angle = { label: string; src: string }
type Colourway = {
  label: string
  swatch: string
  front: string
  back?: string
  spinFrames?: string[]
  photographed?: boolean
}
type Garment = {
  id: string
  name: string
  category: string
  price: string
  colour: string
  colours: Colourway[]
}

const img = (name: string) => `/images/cutouts/${name}.webp`

const garments: Garment[] = [
  {
    id: 'stussy-fleece', name: 'Abstract sherpa fleece', category: 'Stüssy · Fleece jacket', price: '£185', colour: 'Burgundy / ember',
    colours: [
      { label: 'Ember', swatch: '#8e2436', front: img('stussy-front'), back: img('stussy-back'), photographed: true },
      { label: 'Midnight', swatch: '#263c5c', front: img('stussy-front-midnight'), back: img('stussy-back-midnight') },
      { label: 'Pine', swatch: '#46634c', front: img('stussy-front-pine'), back: img('stussy-back-pine') },
      { label: 'Oxblood', swatch: '#713044', front: img('stussy-front-oxblood'), back: img('stussy-back-oxblood') },
    ],
  },
  {
    id: 'eight-ball', name: 'Eight Ball sherpa', category: 'Graphic outerwear', price: '£210', colour: 'Cream / orange',
    colours: [
      { label: 'Cream', swatch: '#e8dfc8', front: img('eightball-cream'), photographed: true },
      { label: 'Orange', swatch: '#ef791a', front: img('eightball-orange'), photographed: true },
    ],
  },
  {
    id: 'north-face', name: 'Colour-block down jacket', category: 'Puffer · Nylon shell', price: '£280', colour: 'Blue / black',
    colours: [
      { label: 'Blue', swatch: '#1596dc', front: img('northface-blue'), photographed: true },
      { label: 'Pine', swatch: '#46634c', front: img('northface-blue-pine') },
      { label: 'Burgundy', swatch: '#713044', front: img('northface-blue-burgundy') },
      { label: 'Graphite', swatch: '#414342', front: img('northface-blue-graphite') },
    ],
  },
  {
    id: 'carhartt', name: 'Detroit-style work jacket', category: 'Workwear · Canvas', price: '£165', colour: 'Washed red',
    colours: [
      { label: 'Washed red', swatch: '#8b3440', front: img('carhartt-front'), photographed: true },
      { label: 'Olive', swatch: '#66704a', front: img('carhartt-front-olive') },
      { label: 'Navy', swatch: '#344b68', front: img('carhartt-front-navy') },
      { label: 'Charcoal', swatch: '#45413e', front: img('carhartt-front-charcoal') },
    ],
  },
]

function wrap(index: number, length: number) { return (index + length) % length }

export default function GarmentCarousel() {
  const [active, setActive] = useState(0)
  const [colourIndex, setColourIndex] = useState(0)
  const [angle, setAngle] = useState(0)
  const [coloursOpen, setColoursOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredGarment, setHoveredGarment] = useState<number | null>(null)
  const startX = useRef<number | null>(null)
  const moved = useRef(false)
  const stageRef = useRef<HTMLElement>(null)
  const current = garments[active]
  const selectedColour = current.colours[colourIndex]
  const angles: Angle[] = selectedColour.spinFrames?.length
    ? selectedColour.spinFrames.map((src, index) => ({ label: `Angle ${String(index + 1).padStart(2, '0')}`, src }))
    : selectedColour.back
      ? [{ label: 'Front', src: selectedColour.front }, { label: 'Back', src: selectedColour.back }]
      : [{ label: 'Product view', src: selectedColour.front }]
  const currentAngle = angles[angle % angles.length]

  const go = useCallback((next: number) => {
    setActive(wrap(next, garments.length))
    setColourIndex(0)
    setAngle(0)
    setColoursOpen(false)
  }, [])
  const next = useCallback(() => go(active + 1), [active, go])
  const prev = useCallback(() => go(active - 1), [active, go])
  const changeAngle = useCallback((direction: number) => {
    if (angles.length < 2) return
    setAngle(value => wrap(value + direction, angles.length))
  }, [angles.length])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!stageRef.current?.contains(document.activeElement)) return
      if (event.key === 'ArrowRight') { event.preventDefault(); angles.length > 1 ? changeAngle(1) : next() }
      if (event.key === 'ArrowLeft') { event.preventDefault(); angles.length > 1 ? changeAngle(-1) : prev() }
      if (event.key === 'Home') { event.preventDefault(); go(0) }
      if (event.key === 'End') { event.preventDefault(); go(garments.length - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [angles.length, changeAngle, go, next, prev])

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('.gc-arrow')) return
    startX.current = event.clientX
    moved.current = false
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (startX.current === null) return
    const delta = event.clientX - startX.current
    if (Math.abs(delta) > 38) {
      moved.current = true
      if (angles.length > 1) changeAngle(delta < 0 ? 1 : -1)
      else delta < 0 ? next() : prev()
    }
    startX.current = null
    setIsDragging(false)
    if (moved.current) window.setTimeout(() => { moved.current = false }, 0)
  }
  const onPointerCancel = () => { startX.current = null; setIsDragging(false) }

  const visible = useMemo(() => garments.map((item, index) => {
    let offset = index - active
    if (offset > garments.length / 2) offset -= garments.length
    if (offset < -garments.length / 2) offset += garments.length
    return { item, index, offset }
  }), [active])

  return (
    <section ref={stageRef} className="gc-shell" aria-label="Shop the outerwear collection" tabIndex={0}>
      <div className="gc-heading">
        <div>
          <p className="gc-kicker">THE ARCHIVE / 001—004</p>
          <h2>Outerwear, <em>in rotation.</em></h2>
          <p className="gc-intro">Move through the edit. Find the piece that feels like yours.</p>
        </div>
        <div className="gc-count"><span>{String(active + 1).padStart(2, '0')}</span><i />{String(garments.length).padStart(2, '0')}</div>
      </div>

      <div
        className={`gc-stage ${isDragging ? 'is-dragging' : ''} ${hoveredGarment !== null ? 'has-hovered-garment' : ''}`}
        onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
        onLostPointerCapture={onPointerCancel}
        role="group" aria-roledescription="product image viewer" aria-label={`${current.name}, ${currentAngle.label}`}
      >
        <div className="gc-stage-glow" />
        {visible.map(({ item, index, offset }) => {
          const isActive = offset === 0
          const hidden = Math.abs(offset) > 1
          const itemColour = item.colours[0]
          const image = isActive ? currentAngle.src : itemColour.front
          return (
            <button
              type="button" key={item.id}
              className={`gc-slide ${isActive ? 'is-active' : ''} ${hidden ? 'is-hidden' : ''} ${hoveredGarment === index ? 'is-hovered' : ''}`}
              style={{ '--offset': offset, '--distance': Math.abs(offset), '--x': `${offset * 205}px`, '--rotate': `${offset * -22}deg`, '--mobile-rotate': `${offset * -18}deg`, '--scale': `${1 - Math.abs(offset) * 0.105}`, '--mobile-scale': `${1 - Math.abs(offset) * 0.12}`, '--opacity': `${1 - Math.abs(offset) * 0.28}`, zIndex: 10 - Math.abs(offset) } as CSSProperties}
              onMouseEnter={() => setHoveredGarment(index)}
              onMouseLeave={() => setHoveredGarment(null)}
              onFocus={() => setHoveredGarment(index)}
              onBlur={() => setHoveredGarment(null)}
              onClick={() => { if (moved.current) { moved.current = false; return } if (!isActive) go(index) }}
              aria-label={`Show ${item.name}${isActive ? ', selected' : ''}`}
              aria-current={isActive ? 'true' : undefined}
              tabIndex={hidden ? -1 : 0}
            >
              <span className="gc-slide-image-wrap"><img key={image} src={image} alt="" draggable={false} loading={Math.abs(offset) > 0 ? 'lazy' : 'eager'} /></span>
              <span className="gc-slide-hover-label" aria-hidden="true">{isActive ? (angles.length > 1 ? 'Drag to rotate' : 'Selected piece') : 'Explore piece'} <ArrowUpRight size={13} /></span>
            </button>
          )
        })}
        <button className="gc-arrow gc-arrow-left" onClick={() => angles.length > 1 ? changeAngle(-1) : prev()} aria-label={angles.length > 1 ? 'Previous product angle' : 'Previous garment'}><ArrowLeft size={19} /></button>
        <button className="gc-arrow gc-arrow-right" onClick={() => angles.length > 1 ? changeAngle(1) : next()} aria-label={angles.length > 1 ? 'Next product angle' : 'Next garment'}><ArrowRight size={19} /></button>
        <div className="gc-drag-note"><span className="gc-drag-line" /> {angles.length > 1 ? 'DRAG TO ROTATE · FRONT / BACK' : 'DRAG TO EXPLORE'} <span className="gc-drag-line" /></div>
      </div>

      <div className="gc-product-row" aria-live="polite" aria-atomic="true">
        <div className="gc-product-copy">
          <p className="gc-product-category">{current.category}</p>
          <h3>{current.name}</h3>
          <p className="gc-product-colour">{selectedColour.label} · {current.colour}</p>
        </div>
        <div className="gc-product-actions">
          <span className="gc-price">{current.price}</span>
          <button className="gc-view-product" type="button" onClick={() => setColoursOpen(value => !value)} aria-expanded={coloursOpen}>
            {coloursOpen ? 'Hide colours' : 'View colours'} {coloursOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="gc-controls-row">
        <div className="gc-dots" aria-label="Choose a garment">
          {garments.map((item, index) => (
            <button key={item.id} className={`gc-dot ${active === index ? 'is-selected' : ''}`} onClick={() => go(index)} aria-label={`Go to ${item.name}`} aria-pressed={active === index} />
          ))}
        </div>
        <div className="gc-view-controls">
          {angles.length > 1 ? (
            <div className="gc-view-switch" aria-label="Choose garment angle">
              <RotateCcw size={14} />
              {angles.map((v, i) => <button key={v.label} className={angle === i ? 'is-selected' : ''} onClick={() => setAngle(i)} aria-pressed={angle === i}>{v.label}</button>)}
              <small>{String(angle + 1).padStart(2, '0')} / {String(angles.length).padStart(2, '0')}</small>
            </div>
          ) : <span className="gc-single-view">ONE PHOTOGRAPHED ANGLE</span>}
        </div>
      </div>

      {coloursOpen && (
        <div className="gc-colour-panel" aria-label="Available colour options">
          <div className="gc-colour-panel-heading">
            <div><span className="gc-kicker">CHOOSE YOUR COLOUR</span><p>Same piece, different mood.</p></div>
            <span className="gc-colour-count">{current.colours.length} COLOURWAYS</span>
          </div>
          <div className="gc-colour-options">
            {current.colours.map((colour, index) => (
              <button key={colour.label} className={`gc-colour-option ${colourIndex === index ? 'is-selected' : ''}`} title={`Preview ${colour.label}`} onClick={() => { setColourIndex(index); setAngle(0) }} aria-pressed={colourIndex === index}>
                <span className="gc-colour-swatch" style={{ background: colour.swatch }} />
                <span className="gc-colour-name">{colour.label}</span>
                <span className="gc-colour-type">{colour.photographed ? 'Photographed' : 'Digital preview'}</span>
              </button>
            ))}
          </div>
          <p className="gc-colour-disclaimer"><Sparkles size={13} /> Digital previews are colour studies generated from the supplied photograph, not verified stock colourways. Original photographed options are labelled accordingly.</p>
        </div>
      )}

      <div className="gc-rotation-note">
        <span className="gc-rotation-icon"><RotateCcw size={15} /></span>
        <div><b>{angles.length > 1 ? 'Angle switching enabled' : 'More angles needed for true 360°'}</b><p>{angles.length > 1 ? 'Drag the garment or use the angle controls to switch between the supplied front and back photographs.' : 'This item currently has one supplied angle. A genuine 360° spin needs a consistent photo sequence, ideally 24–36 frames around the garment.'}</p></div>
      </div>

      <div className="gc-rail-header">
        <div><span className="gc-kicker">THE FULL EDIT</span><p>Every piece, one place.</p></div>
        <span className="gc-rail-hint">SELECT A PIECE <ArrowUpRight size={13} /></span>
      </div>
      <div className="gc-rail" role="list" aria-label="All garments">
        {garments.map((item, index) => (
          <button key={item.id} role="listitem" className={`gc-rail-item ${active === index ? 'is-current' : ''}`} title={`Explore ${item.name}`} onClick={() => go(index)} aria-pressed={active === index}>
            <span className="gc-rail-image"><img src={item.colours[0].front} alt="" loading="lazy" /></span>
            <span className="gc-rail-meta"><span>{String(index + 1).padStart(2, '0')}</span><b>{item.name}</b></span>
          </button>
        ))}
      </div>
      <div className="gc-details-anchor">
        <span>PRODUCT IMAGE NOTE</span>
        <p>Supplied product photographs have been separated into transparent WebP cut-outs. Only the Stüssy fleece has both front and back photographs, so other items are shown from their available angle rather than inventing unseen sides.</p>
      </div>
    </section>
  )
}
