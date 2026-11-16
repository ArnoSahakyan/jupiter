import { useEffect } from 'react'
import { IconClose } from '../Icons/MenuIcons'
import './Lightbox.scss'

type LightboxProps = {
  images: { src: string; alt: string }[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox='0 0 16 16' width='22' height='22' fill='currentColor' aria-hidden='true' style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path fillRule='evenodd' d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0' />
  </svg>
)

// Full-screen photo viewer: arrows / ← → to move, Escape or a backdrop click to close.
export default function Lightbox({ images, index, onIndex, onClose }: LightboxProps) {
  const hasPrev = index > 0
  const hasNext = index < images.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onIndex(index - 1)
      if (e.key === 'ArrowRight' && hasNext) onIndex(index + 1)
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [index, hasPrev, hasNext, onIndex, onClose])

  const image = images[index]
  if (!image) return null

  return (
    <div className='Lightbox' role='dialog' aria-modal='true' aria-label='Photo viewer' onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <button type='button' className='Lightbox__close' aria-label='Close' onClick={onClose}><IconClose /></button>
      {hasPrev && <button type='button' className='Lightbox__nav prev' aria-label='Previous photo' onClick={() => onIndex(index - 1)}><Arrow /></button>}
      <img src={image.src} alt={image.alt} />
      {hasNext && <button type='button' className='Lightbox__nav next' aria-label='Next photo' onClick={() => onIndex(index + 1)}><Arrow flip /></button>}
      <span className='Lightbox__count'>{index + 1} / {images.length}</span>
    </div>
  )
}
