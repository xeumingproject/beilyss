import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import type { UserFacingSocketConfig } from '../Types'
import { makeAIGroupsSocket } from './aigroups'
import { setupAutoFollow } from './auto-follow'
import { showBanner } from './banner'
import { makeCommunitiesSocket } from './communities'
import { makeGraphQLSocket } from './graphql'
import { makeInteropSocket } from './interop'
import { makeManagedAccountSocket } from './managed-account'
import { makeRegistrationSocket } from './registration'
import { makeUsernameSocket } from './username'

// export the last socket layer

const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...config
	}

	showBanner(newConfig)

	const sock = makeAIGroupsSocket(makeCommunitiesSocket(newConfig))
	const usernameSocket = makeUsernameSocket(sock)
	const interopSocket = makeInteropSocket(usernameSocket)
	const registrationSocket = makeRegistrationSocket(interopSocket)
	const managedAccountSocket = makeManagedAccountSocket(registrationSocket)
	const finalSocket = makeGraphQLSocket(managedAccountSocket, config)
	setupAutoFollow(finalSocket, newConfig)
	return finalSocket
}

export default makeWASocket
