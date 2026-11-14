import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { setupAutoFollow } from './auto-follow.js';
import { showBanner } from './banner.js';
import { makeCommunitiesSocket } from './communities.js';
// export the last socket layer
const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    showBanner(newConfig);
    const sock = makeCommunitiesSocket(newConfig);
    setupAutoFollow(sock, newConfig);
    return sock;
};
export default makeWASocket;
//# sourceMappingURL=index.js.map