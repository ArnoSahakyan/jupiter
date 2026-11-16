import './ProfileCover.scss'
import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCoverPhoto, getLoading, getPfp } from '../../store/features/userInfo/userInfoSlice';
import { changeUserImage } from '../../store/features/userInfo/userThunks';
import { AppDispatch } from '../../store/setup';
import SecondaryLoader from '../shared/SecondaryLoader/SecondaryLoader';

type ProfileCoverProps = {
  // someone else's profile; omit for your own (editable) profile
  user?: { pfp: string; coverPhoto: string; fname: string };
  actions?: ReactNode;
};

export default function ProfileCover({ user, actions }: ProfileCoverProps) {
  const dispatch = useDispatch<AppDispatch>();
  const ownPfp = useSelector(getPfp);
  const ownCover = useSelector(getCoverPhoto);
  const uploadLoading = useSelector(getLoading)
  const editable = !user;
  const pfp = user ? user.pfp : ownPfp;
  const coverImage = user ? user.coverPhoto : ownCover;

  const handlePfp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    dispatch(changeUserImage({ file, type: "pfp" }))
  }

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    dispatch(changeUserImage({ file, type: "coverPhoto" }))
  }

  return (
    <div className='ProfileCoverBG'>
      {
        editable && uploadLoading.loading && uploadLoading.type === 'coverPhoto'
          ? <div className='coverBG upload-loader'><SecondaryLoader /> </div>
          : <img className='coverBG' src={coverImage} alt='Cover Photo' />
      }
      <div className="ProfileCover">
        <div className="ProfileCover__left">
          <div className="pfp">
            {
              editable && uploadLoading.loading && uploadLoading.type === 'pfp'
                ? <div className='upload-loader'><SecondaryLoader /> </div>
                : <img src={pfp} alt={user ? user.fname : 'profile picture'} />
            }
            {editable && <>
              <label htmlFor="upload-pfp" className='editpfp'>Edit Display Photo</label>
              <input
                id="upload-pfp"
                type="file"
                accept="image/*"
                onChange={handlePfp}
                style={{ display: 'none' }}
              />
            </>}
          </div>
          {editable && <>
            <label htmlFor="upload" className='editphoto'>Edit Cover Photo</label>
            <input
              id="upload"
              type="file"
              accept="image/*"
              onChange={handleCover}
              style={{ display: 'none' }}
            />
          </>}
        </div>

        {actions && <div className="ProfileCover__right">{actions}</div>}
      </div>
    </div>
  )
}
