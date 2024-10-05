export type PluginOptions = {
	limit: number
	window: number
	includeHeaders: boolean
}

export const DEFAULT_OPTIONS: PluginOptions = {
	limit: 5,
	window: 60, // 1min
	includeHeaders: true,
}
