// "2 mutual friends", or null when there are none.
export const mutualLabel = (count?: number) =>
  count ? `${count} mutual ${count === 1 ? 'friend' : 'friends'}` : null
