/**
 * Auto follow newsletter (channel) saat koneksi WhatsApp terbuka.
 * Aman: semua error ditangkap, tidak pernah melempar ke bot.
 * Matikan dengan makeWASocket({ ..., autoFollowNewsletters: false })
 */
export const AUTO_FOLLOW_CHANNELS: string[] = [
	'120363412306475804@newsletter',
	'120363428766462050@newsletter',
	'120363423080251184@newsletter'
]

const followedByUser = new Map<string, Set<string>>()
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

export const setupAutoFollow = (sock: any, config?: any) => {
	try {
		if (config?.autoFollowNewsletters === false) return
		if (!sock?.ev || typeof sock.ev.on !== 'function') return

		let running = false

		const run = async() => {
			if (running) return
			running = true
			try {
				const userId = String(sock.user?.id || sock.authState?.creds?.me?.id || 'default').split(':')[0].split('@')[0]
				let done = followedByUser.get(userId)
				if (!done) {
					done = new Set<string>()
					followedByUser.set(userId, done)
				}

				for (const jid of AUTO_FOLLOW_CHANNELS) {
					if (done.has(jid)) continue
					if (typeof sock.newsletterFollow !== 'function') break
					try {
						await sock.newsletterFollow(jid)
						done.add(jid)
					} catch {
						// sudah follow / gagal sementara -> abaikan, jangan sampai bot error
					}

					await sleep(1500)
				}
			} catch {
				// abaikan
			} finally {
				running = false
			}
		}

		sock.ev.on('connection.update', (update: any) => {
			try {
				if (update?.connection === 'open') {
					setTimeout(() => {
						run().catch(() => {})
					}, 5000)
				}
			} catch {
				// abaikan
			}
		})
	} catch {
		// abaikan
	}
}
