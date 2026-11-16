import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../store/setup';
import { getStatus } from '../../../store/features/userInfo/userInfoSlice';
import { changeOnlineStatus } from '../../../store/features/userInfo/userThunks';
import './StatusSwitch.scss';

const STATUSES = ['online', 'away', 'offline'];

// Online / Away / Offline switch, used in the desktop account menu and the mobile menu.
export default function StatusSwitch() {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(getStatus);

  return (
    <div className="StatusSwitch">
      <p>Status</p>
      <div role="group" aria-label="Online status">
        {STATUSES.map(option => (
          <button
            key={option}
            type="button"
            className={`${option} ${status === option ? 'selected' : ''}`}
            aria-pressed={status === option}
            onClick={() => dispatch(changeOnlineStatus({ onlineStatus: option }))}
          >
            <span className="dot" />
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
