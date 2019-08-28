import * as R from 'ramda'

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
  extensionIsActive: 'extensionIsActive',
  user: 'user',
  accessToken: 'accessToken',
  isSignedIn: 'isSignedIn',
  highlightedElements: 'highlightedElements',
  canNavigateToDifferentURL: 'canNavigateToDifferentURL',
}

export const PRIVATE_STORAGE_KEYS = {
  cacheMetadataInfo: 'cacheMetadataInfo',
}

export const MESSAGE_KEYS = {
  onStopWorking: 'onStopWorking',
  onGoToNextPage: 'onGoToNextPage',
  onGoToNextPageWithoutSaving: 'onGoToNextPageWithoutSaving',
  onGoToPrevPage: 'onGoToPrevPage',
  onGoToNextPageFromPopUp: 'onGoToNextPageFromPopUp',
  onContentScriptLoaded: 'onContentScriptLoaded',
  onClearCache: 'onClearCache',
}

export const DEFAULT_STORAGE_VALUES = {
  [STORAGE_KEYS.highlightedElements]: {},
  [STORAGE_KEYS.extensionIsActive]: false,
  [PRIVATE_STORAGE_KEYS.cacheMetadataInfo]: {},
}

export const REMOVABLE_KEYS = R.filter(val => ![
  STORAGE_KEYS.user,
  STORAGE_KEYS.accessToken,
].includes(val), R.values(R.concat(R.values(STORAGE_KEYS), R.values(PRIVATE_STORAGE_KEYS))))

export const GOOGLE_REVOKE_TOKEN_API_URL = 'https://accounts.google.com/o/oauth2/revoke'

export const POPUP_PAGE_VIEWS = {
  default: 'default',
  settingsPage: 'settingsPage', 
}
