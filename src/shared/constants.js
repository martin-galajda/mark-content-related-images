export const IDS = {
  startWorkingBtn: 'startWorkingBtn',
  stopWorkingBtn: 'stopWorkingBtn',
  proceedToNextPageBtn: 'proceedToNextPageBtn',
  resetBtn: 'resetBtn',
  signInBtn: 'signInBtn',
  signedInBadgeWrapper: 'signedInBadgeWrapper',
  signedInBadge: 'signedInBadge',
  appRoot: 'appRoot',
}

export const STORAGE_KEYS = {
  highlightedElements: 'highlightedElements',
  extensionIsActive: 'extensionIsActive',
  processedUrls: 'processedUrls',
  allUrls: 'allUrls',
  activeUrl: 'activeUrl',
  user: 'user',
  accessToken: 'accessToken',
}

export const MESSAGE_KEYS = {
  onStopWorking: 'onStopWorking',
  onGoToNextPage: 'onGoToNextPage',
  onGoToNextPageFromPopUp: 'onGoToNextPageFromPopUp',
}

export const DEFAULT_STORAGE_VALUES = {
  [STORAGE_KEYS.highlightedElements]: {},
  [STORAGE_KEYS.extensionIsActive]: false,
  [STORAGE_KEYS.processedUrls]: [],
  [STORAGE_KEYS.allUrls]: [],
  [STORAGE_KEYS.processedUrlsData]: [],
  [STORAGE_KEYS.activeUrl]: '',
}
