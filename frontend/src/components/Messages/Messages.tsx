import './Messages.scss'
import MessagesContent from './MessagesContent/MessagesContent'

// The Messages page: conversation list and chat, filling the screen below the navbar.
export default function Messages() {
  return (
    <div className='Messages'>
      <MessagesContent />
    </div>
  )
}
