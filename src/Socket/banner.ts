/**
 * Banner ASCII yang tampil sekali di console saat makeWASocket pertama kali dipanggil.
 * Matikan dengan makeWASocket({ ..., showBanner: false })
 */
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

export const showBanner = (config?: any) => {
	try {
		if (shown || config?.showBanner === false) return
		shown = true
		const color = !!process.stdout?.isTTY && !process.env.NO_COLOR
		const paint = (text: string, code: string): string => (color ? `\x1b[${code}m${text}\x1b[0m` : text)
		const out = [
			'',
			...XEU_LINES.map(l => paint(l, '36;1')),
			...MING_LINES.map(l => paint(l, '35;1')),
			'',
			...INFO_LINES.map(l => paint(l, '37')),
			''
		]
		console.log(out.join('\n'))
	} catch {
		// abaikan, banner tidak boleh bikin bot error
	}
}
