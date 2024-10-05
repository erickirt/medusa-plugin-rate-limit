import { type ConfigModule, type MedusaRequest } from '@medusajs/framework'
import { DEFAULT_OPTIONS, type PluginOptions } from '../constants'

const PLUGIN_RESOLUTION_PATH = '@perseidesjs/medusa-plugin-rate-limit'

export function getExtendedPluginOptions(
	scope: MedusaRequest['scope'],
): PluginOptions {
	const configModule = scope.resolve<ConfigModule>('configModule')
	const plugins = configModule.plugins

	if (!plugins || plugins.length === 0) {
		return DEFAULT_OPTIONS
	}

	const hasResolveAndOptions = (
		plugin: (typeof plugins)[number],
	): plugin is { resolve: string; options: Record<string, unknown> } => {
		return (
			typeof plugin === 'object' &&
			plugin !== null &&
			'resolve' in plugin &&
			'options' in plugin
		)
	}
	const foundPlugin = plugins
		.filter(hasResolveAndOptions)
		.find((plugin) => plugin.resolve === PLUGIN_RESOLUTION_PATH)

	const options = foundPlugin?.options as Partial<PluginOptions>

	return {
		limit: options.limit ?? DEFAULT_OPTIONS.limit,
		window: options.window ?? DEFAULT_OPTIONS.window,
		includeHeaders: options.includeHeaders ?? DEFAULT_OPTIONS.includeHeaders,
	}
}
