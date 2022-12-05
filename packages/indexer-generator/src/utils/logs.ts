import debug from 'debug'

export const logErrorDebug = debug('gen:error')
export const logWarnDebug = debug('gen:warn')
export const logInfoDebug = debug('gen:info')
export const logDebug = debug('gen:debug')
export const logTrace = debug('gen:trace')

export const logError = logErrorDebug.enabled
  ? logErrorDebug
  : console.error.bind(console)

export const logWarn = logErrorDebug.enabled
  ? logWarnDebug
  : console.warn.bind(console)

export const logInfo = logInfoDebug.enabled
  ? logInfoDebug
  : console.log.bind(console)
