import { type PluginOptions } from '../constants'
import { configManager } from './global-configuration'

export function configureDefaults(options: Partial<PluginOptions>): void {
  configManager.setConfig(options)
}