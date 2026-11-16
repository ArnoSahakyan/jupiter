import './Reload.scss'

type ReloadProps = {
  func: () => void;
  label?: string;
};

// "Load more" button under feeds and photo grids.
export default function Reload({ func, label = 'Load more' }: ReloadProps) {
  return (
    <button type='button' className="reload" onClick={() => func()}>
      {label}
      <svg viewBox='0 0 16 16' width='14' height='14' fill='currentColor' aria-hidden='true'>
        <path fillRule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708' />
      </svg>
    </button>
  )
}
