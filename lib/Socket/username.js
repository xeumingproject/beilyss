import { randomUUID } from 'crypto';
import { QueryIds, XWAPaths } from '../Types/index.js';
import { USyncQuery, USyncUser } from '../WAUSync/index.js';
import { executeWMexQuery } from './mex.js';
export const makeUsernameSocket = (sock) => {
    const { query, generateMessageTag, executeUSyncQuery } = sock;
    const runUsernameQuery = (variables, queryId, dataPath) => executeWMexQuery(variables, queryId, dataPath, query, generateMessageTag);
    const checkUsername = async (username, includeSuggestions = true, sessionId) => {
        const session_id = sessionId || randomUUID();
        const result = await runUsernameQuery({
            username,
            include_suggestions: includeSuggestions,
            session_id,
            source: 'USER_INPUT'
        }, QueryIds.USERNAME_CHECK, XWAPaths.xwa2_username_check);
        const successful = result?.result === 'SUCCESS';
        if (successful) {
            return { available: true, username, session_id };
        }
        return {
            available: false,
            username,
            session_id,
            suggestions: result?.suggestions ?? [],
            rejectionReasons: result?.rejection_reasons ?? [],
            suggestionsEligible: result?.suggestions_eligible ?? true
        };
    };
    const setUsername = async (username, options = {}) => {
        const { source = 'USER_INPUT', sessionId, pin } = options;
        const variables = {
            username,
            reserved: true,
            source,
            session_id: sessionId || randomUUID()
        };
        if (pin) {
            variables.pin = pin;
        }
        return runUsernameQuery(variables, QueryIds.USERNAME_SET, XWAPaths.xwa2_username_set);
    };
    const checkAndSetUsername = async (username, includeSuggestions = true) => {
        const checked = await checkUsername(username, includeSuggestions);
        if (!checked.available) {
            return checked;
        }
        return setUsername(username, { sessionId: checked.session_id });
    };
    const deleteUsername = async () => runUsernameQuery({ username: null }, QueryIds.USERNAME_SET, 'xwa2_username_delete');
    const getMyUsername = async () => {
        const result = await runUsernameQuery({}, QueryIds.USERNAME_GET, XWAPaths.xwa2_username_get);
        return result?.username ?? null;
    };
    const setUsernamePin = async (pin) => {
        const variables = pin === null || pin === undefined ? {} : { pin };
        return runUsernameQuery(variables, QueryIds.USERNAME_PIN_SET, XWAPaths.xwa2_username_pin_set);
    };
    const findUserByUsername = async (username, pin) => {
        const usync = new USyncQuery().withContactProtocol();
        const user = new USyncUser().withUsername(username);
        if (pin) {
            user.withUsernameKey(pin);
        }
        usync.withUser(user);
        const result = await executeUSyncQuery(usync);
        const entry = result?.list?.[0];
        return entry ? { jid: entry.id, contact: entry.contact ?? false } : null;
    };
    const fetchContactUsernames = async (...jids) => {
        const usync = new USyncQuery().withUsernameProtocol();
        for (const jid of jids) {
            usync.withUser(new USyncUser().withId(jid));
        }
        const result = await executeUSyncQuery(usync);
        return result?.list ?? [];
    };
    const checkUsernameMulti = async (usernames) => runUsernameQuery({ usernames }, QueryIds.USERNAME_CHECK_MULTI, XWAPaths.xwa2_username_check_multi);
    const getUsernameRecommendations = async (source) => {
        const variables = source ? { source } : {};
        return runUsernameQuery(variables, QueryIds.USERNAME_GET_RECOMENDATION, XWAPaths.xwa2_username_get_recommendations);
    };
    return {
        ...sock,
        checkUsername,
        checkAndSetUsername,
        checkUsernameMulti,
        setUsername,
        deleteUsername,
        getMyUsername,
        getUsernameRecommendations,
        setUsernamePin,
        findUserByUsername,
        fetchContactUsernames
    };
};
//# sourceMappingURL=username.js.map