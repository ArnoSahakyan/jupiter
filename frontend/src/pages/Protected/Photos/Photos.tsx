import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { TProfile } from '../../../api/profiles'
import { getUserPhotos } from '../../../store/features/post/postThunks'
import Reload from '../../../components/shared/Reload/Reload'
import Lightbox from '../../../components/shared/Lightbox/Lightbox'
import { AppDispatch } from '../../../store/setup'
import './Photos.scss'

type TPhoto = { postId: number, image: string }

type TPhotosPage = {
  totalItems: number,
  totalPages: number,
  currentPage: number,
  offset: number,
  data: TPhoto[],
}

const LIMIT = 9

// Photos tab of your profile or someone else's.
export default function Photos() {
  const dispatch = useDispatch<AppDispatch>()
  // set when shown on someone else's profile (/user/:id/photos)
  const profile = useOutletContext<{ profile?: TProfile } | undefined>()?.profile
  const userId = profile?.id
  const [photos, setPhotos] = useState<TPhoto[]>([])
  const [page, setPage] = useState<Omit<TPhotosPage, 'data'> | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState<number | null>(null)

  const load = useCallback((offset: number) => {
    setLoading(true)
    dispatch(getUserPhotos({ limit: LIMIT, offset, userId }))
      .then(res => {
        if (!getUserPhotos.fulfilled.match(res)) return
        const { data, ...rest } = res.payload as TPhotosPage
        setPage(rest)
        setPhotos(previous => {
          const shown = offset === 0 ? [] : previous
          const ids = new Set(shown.map(p => p.postId))
          return [...shown, ...data.filter(p => p.image && !ids.has(p.postId))]
        })
      })
      .finally(() => setLoading(false))
  }, [dispatch, userId])

  useEffect(() => {
    setPhotos([])
    setPage(null)
    load(0)
  }, [load])

  const close = useCallback(() => setOpen(null), [])
  const owner = profile ? profile.fname.split(' ')[0] : null
  const hasMore = page !== null && page.currentPage < page.totalPages

  return (
    <div className='Photos'>
      <div className='Photos__header'>
        <h2>Photos{page && page.totalItems > 0 ? <span> · {page.totalItems}</span> : null}</h2>
      </div>

      {page && photos.length === 0 && !loading ? (
        <div className='Photos__empty'>
          <strong>No photos yet</strong>
          <span>{owner ? `${owner} hasn't shared any photos.` : 'Photos you add to your posts show up here.'}</span>
        </div>
      ) : (
        <div className='Photos__grid'>
          {photos.map((photo, index) => (
            <button key={photo.postId} type='button' className='Photos__tile' onClick={() => setOpen(index)} aria-label={`Open photo ${index + 1}`}>
              <img src={photo.image} alt='' loading='lazy' />
            </button>
          ))}
          {loading && Array.from({ length: photos.length ? 3 : 6 }, (_, i) => <div key={`ph-${i}`} className='Photos__placeholder' />)}
        </div>
      )}

      {!loading && hasMore && <Reload func={() => load(photos.length)} label='Load more photos' />}

      {open !== null && (
        <Lightbox
          images={photos.map((photo, i) => ({ src: photo.image, alt: `Photo ${i + 1}` }))}
          index={open}
          onIndex={setOpen}
          onClose={close}
        />
      )}
    </div>
  )
}
