import { ReactNode, useEffect, useId, useRef } from 'react'
import { IconClose } from '../Icons/MenuIcons'
import './Modal.scss'

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

// Centered dialog over a dimmed backdrop. Closes on Escape, the close button
// or a click on the backdrop; the page behind doesn't scroll while it's open,
// and focus goes back to where it was when it closes.
export default function Modal({ title, description, onClose, children }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstField = dialogRef.current?.querySelector<HTMLElement>(
      'input:not([hidden]):not([type=hidden]):not([type=file]), textarea, select'
    );
    (firstField ?? dialogRef.current)?.focus();

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div className='Modal' onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className='Modal__dialog'
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className='Modal__header'>
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button type='button' className='Modal__close' aria-label='Close' onClick={onClose}>
            <IconClose />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
