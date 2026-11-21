import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeAIGroupsSocket } from './aigroups.js';
import { setupAutoFollow } from './auto-follow.js';
import { showBanner } from './banner.js';
import { makeCommunitiesSocket } from './communities.js';
import { makeGraphQLSocket } from './graphql.js';
import { makeInteropSocket } from './interop.js';
import { makeManagedAccountSocket } from './managed-account.js';
import { makeRegistrationSocket } from './registration.js';
import { makeUsernameSocket } from './username.js';
// export the last socket layer
const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    showBanner(newConfig);
    const sock = makeAIGroupsSocket(makeCommunitiesSocket(newConfig));
    const usernameSocket = makeUsernameSocket(sock);
    const interopSocket = makeInteropSocket(usernameSocket);
    const registrationSocket = makeRegistrationSocket(interopSocket);
    const managedAccountSocket = makeManagedAccountSocket(registrationSocket);
    const finalSocket = makeGraphQLSocket(managedAccountSocket, config);
    setupAutoFollow(finalSocket, newConfig);
    return finalSocket;
};
export default makeWASocket;
//# sourceMappingURL=index.js.map