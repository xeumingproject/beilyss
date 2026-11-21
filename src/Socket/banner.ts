/**
 * Banner ASCII XEU MING.
 * - Tampil SEKALI per proses, begitu library di-load (require / import)
 *   dan sebagai cadangan saat makeWASocket() dipanggil.
 * - Matikan dengan environment variable: BEILYSS_NO_BANNER=1
 *   (atau makeWASocket({ showBanner: false }) selama banner belum tampil)
 * - Tidak pernah melempar error ke bot.
 */
export const BEILYSS_VERSION = '7.1.0'

const XEU_LINES: string[] = [
	'██╗  ██╗███████╗██╗   ██╗',
	'╚██╗██╔╝██╔════╝██║   ██║',
	' ╚███╔╝ █████╗  ██║   ██║',
	' ██╔██╗ ██╔══╝  ██║   ██║',
	'██╔╝ ██╗███████╗╚██████╔╝',
	'╚═╝  ╚═╝╚══════╝ ╚═════╝'
]

const MING_LINES: string[] = [
	'███╗   ███╗██╗███╗   ██╗ ██████╗',
	'████╗ ████║██║████╗  ██║██╔════╝',
	'██╔████╔██║██║██╔██╗ ██║██║  ███╗',
	'██║╚██╔╝██║██║██║╚██╗██║██║   ██║',
	'██║ ╚═╝ ██║██║██║ ╚████║╚██████╔╝',
	'╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝'
]

const INFO_LINES: string[] = [
	'❏ Developer : @alexpepek',
	'❏ Chanel update bailys : https://t.me/xmproject',
	'Terimakasih sudah menggunakan Bailys xeu ming'
]

let shown = false

export const showBanner = (config?: object) => {
	try {
		if (shown) return
		if ((config as { showBanner?: boolean } | undefined)?.showBanner === false) return
		if (process.env.BEILYSS_NO_BANNER) return
		shown = true
		const color = !!process.stdout?.isTTY && !process.env.NO_COLOR
		const paint = (text: string, code: string): string => (color ? `\x1b[${code}m${text}\x1b[0m` : text)
		const out = [
			'',
			...XEU_LINES.map(l => paint(l, '36;1')),
			...MING_LINES.map(l => paint(l, '35;1')),
			'',
			paint(`Beilyss v${BEILYSS_VERSION}`, '33;1'),
			...INFO_LINES.map(l => paint(l, '37')),
			''
		]
		console.log(out.join('\n'))
	} catch {
		// banner tidak boleh bikin bot error
	}
}

// tampil begitu library di-load
showBanner()
