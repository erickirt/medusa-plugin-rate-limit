import { type PluginOptions } from '../constants'

class ConfigurationManager {
  private static instance: ConfigurationManager
  private config: PluginOptions

  private constructor() {
    this.config = {
      limit: 5,
      window: 60,
      includeHeaders: true
    }
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager()
    }
    return ConfigurationManager.instance
  }

  public setConfig(options: Partial<PluginOptions>): void {
    this.config = {
      ...this.config,
      ...options
    }
  }

  public getConfig(): PluginOptions {
    return { ...this.config }
  }
}

export const configManager = ConfigurationManager.getInstance()