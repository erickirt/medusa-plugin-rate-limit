import { type PluginOptions } from '../constants'
import { configManager } from './global-configuration'

export function getDefaultOptions(): PluginOptions {
  const globalConfig = configManager.getConfig()

  return {
    limit: globalConfig.limit,
    window: globalConfig.window,
    includeHeaders: globalConfig.includeHeaders,
  }
}
