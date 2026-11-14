import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import type { UserFacingSocketConfig } from '../Types'
import { setupAutoFollow } from './auto-follow'
import { showBanner } from './banner'
import { makeCommunitiesSocket } from './communities'

// export the last socket layer
const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...config
	}

	showBanner(newConfig)
	const sock = makeCommunitiesSocket(newConfig)
	setupAutoFollow(sock, newConfig)
	return sock
}

export default makeWASocket
