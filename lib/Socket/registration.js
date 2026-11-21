import { executeWMexQuery } from './mex.js';
export const REGISTRATION_MEX_IDS = {
    HAS_PASSWORD: '25379221318423478',
    SET_PASSWORD: '33855141324134176',
    CHECK_PASSWORD: '26881928138061632',
    DELETE_PASSWORD: '27247058691550586',
    PASSKEY_EXIST: '25188064727509430',
    PASSKEY_LIST_EXIST: '26930537423220681',
    PASSKEY_REQUEST_CHALLENGE: '26311497405176139',
    PASSKEY_VERIFY_CHALLENGE: '26876394218624479',
    PASSKEY_DELETE: '25225683640428243',
    REG_PASSKEY_START: '25415371271434748',
    REG_PASSKEY_FINISH: '24611221275218156',
    REG_PASSKEY_ENABLE: '25147880151540247',
    REG_PASSKEY_DISABLE: '27775237998742831',
    REG_PASSKEY_CLEAR: '25111972538494859',
    REG_PASSKEY_UPDATE_ENCRYPTION_STATUS: '24866837389649930',
    GET_REGISTRATION_UPSELLS: '24265038133175291',
    GET_DYNAMIC_REGISTRATION_UPSELLS: '32273353145641323',
    REGISTRATION_UPSELL_SHOWN: '25896605016620945',
    REGISTRATION_DYNAMIC_UPSELL_SHOWN: '25435755019399064',
    REG_ACCOUNT_TRANSFER_VERIFY_TOKEN: '7580940708621318',
    USER_COUNTRY_CODE: '25292528387076991',
    SUGGESTED_CONTACTS_V2: '31663643799945793',
    AGE_COLLECTION: '33502711132676934',
    GET_AGE_EXPERIENCE: '26567868986241476',
    SET_AGE_EXPERIENCE: '26051006311231325',
    SUBMIT_AGE: '26049558371296621',
    GET_IMAGINE_ME_ONBOARDED: '25082125671408942',
    DELETE_IMAGINE_ME_ONBOARDING: '7106989772737677',
    FETCH_USER_NOTICES: '32114003924880386',
    CREATE_ENFORCEMENT_APPEAL: '26933630359642347',
    GET_WA_ME_LINK: '25001183556215266'
};
export const makeRegistrationSocket = (sock) => {
    const mex = (variables, queryId, dataPath) => executeWMexQuery(variables, queryId, dataPath, sock.query, sock.generateMessageTag);
    const hasPassword = () => mex({}, REGISTRATION_MEX_IDS.HAS_PASSWORD, 'xwa2_has_password');
    const setPassword = (password, oldPassword) => mex({ input: { password, ...(oldPassword ? { old_password: oldPassword } : {}) } }, REGISTRATION_MEX_IDS.SET_PASSWORD, 'xwa2_set_password');
    const checkPassword = (password) => mex({ input: { password } }, REGISTRATION_MEX_IDS.CHECK_PASSWORD, 'xwa2_check_password');
    const deletePassword = (password) => mex({ input: { password } }, REGISTRATION_MEX_IDS.DELETE_PASSWORD, 'xwa2_delete_password');
    const passkeyExists = () => mex({}, REGISTRATION_MEX_IDS.PASSKEY_EXIST, 'xwa2_passkey_exist_response');
    const passkeyListExists = () => mex({}, REGISTRATION_MEX_IDS.PASSKEY_LIST_EXIST, 'xwa2_passkey_list_exist_response');
    const passkeyRequestChallenge = () => mex({}, REGISTRATION_MEX_IDS.PASSKEY_REQUEST_CHALLENGE, 'xwa2_passkey_request_challenge');
    const passkeyVerifyChallenge = (credentialId, authenticatorData, clientDataJson, signature) => mex({
        credential_id: credentialId,
        authenticator_data: authenticatorData,
        client_data_json: clientDataJson,
        signature
    }, REGISTRATION_MEX_IDS.PASSKEY_VERIFY_CHALLENGE, 'xwa2_passkey_verify_challenge');
    const passkeyDelete = (credentialId) => mex({ credential_id: credentialId }, REGISTRATION_MEX_IDS.PASSKEY_DELETE, 'xwa2_passkey_delete');
    const regPasskeyStart = () => mex({}, REGISTRATION_MEX_IDS.REG_PASSKEY_START, 'xwa2_reg_passkey_start_register');
    const regPasskeyFinish = (credentialId, attestationObject, clientDataJson) => mex({ credential_id: credentialId, attestation_object: attestationObject, client_data_json: clientDataJson }, REGISTRATION_MEX_IDS.REG_PASSKEY_FINISH, 'xwa2_reg_passkey_finish_register');
    const regPasskeyEnable = () => mex({}, REGISTRATION_MEX_IDS.REG_PASSKEY_ENABLE, 'xwa2_reg_passkey_enable');
    const regPasskeyDisable = () => mex({}, REGISTRATION_MEX_IDS.REG_PASSKEY_DISABLE, 'xwa2_reg_passkey_disable');
    const regPasskeyClear = () => mex({}, REGISTRATION_MEX_IDS.REG_PASSKEY_CLEAR, 'xwa2_reg_passkey_clear');
    const regPasskeyUpdateEncryptionStatus = (encryptionEnabled) => mex({ encryption_enabled: encryptionEnabled }, REGISTRATION_MEX_IDS.REG_PASSKEY_UPDATE_ENCRYPTION_STATUS, 'xwa2_reg_passkey_update_client_encryption_status');
    const getRegistrationUpsells = () => mex({}, REGISTRATION_MEX_IDS.GET_REGISTRATION_UPSELLS, 'xwa2_dynamic_reg_upsells');
    const getDynamicRegistrationUpsells = () => mex({}, REGISTRATION_MEX_IDS.GET_DYNAMIC_REGISTRATION_UPSELLS, 'xwa2_dynamic_reg_upsells');
    const registrationUpsellShown = (upsellId) => mex({ upsell_id: upsellId }, REGISTRATION_MEX_IDS.REGISTRATION_UPSELL_SHOWN, 'xwa2_reg_dynamic_upsell_shown');
    const registrationDynamicUpsellShown = (upsellId) => mex({ upsell_id: upsellId }, REGISTRATION_MEX_IDS.REGISTRATION_DYNAMIC_UPSELL_SHOWN, 'xwa2_reg_dynamic_upsell_shown');
    const regAccountTransferVerifyToken = (token) => mex({ token }, REGISTRATION_MEX_IDS.REG_ACCOUNT_TRANSFER_VERIFY_TOKEN, 'xwa2_reg_account_transfer_verify_token');
    const userCountryCodeGet = () => mex({}, REGISTRATION_MEX_IDS.USER_COUNTRY_CODE, 'xwa2_user_country_code');
    const suggestedContactsV2 = (limit = 20) => mex({ limit }, REGISTRATION_MEX_IDS.SUGGESTED_CONTACTS_V2, 'xwa2_suggested_contacts_v2');
    const ageCollection = () => mex({}, REGISTRATION_MEX_IDS.AGE_COLLECTION, 'xwa2_age_collection');
    const getAgeExperience = () => mex({}, REGISTRATION_MEX_IDS.GET_AGE_EXPERIENCE, 'xwa2_get_age_experience');
    const setAgeExperience = (birthYear, country) => mex({ input: { birth_year: birthYear, ...(country ? { country } : {}) } }, REGISTRATION_MEX_IDS.SET_AGE_EXPERIENCE, 'xwa2_set_age_experience');
    const submitAge = (birthYear, country) => mex({ input: { birth_year: birthYear, ...(country ? { country } : {}) } }, REGISTRATION_MEX_IDS.SUBMIT_AGE, 'xwa2_submit_age');
    const getImagineMeOnboarded = () => mex({}, REGISTRATION_MEX_IDS.GET_IMAGINE_ME_ONBOARDED, 'xwa2_get_imagine_me_onboarded');
    const deleteImagineMeOnboarding = () => mex({}, REGISTRATION_MEX_IDS.DELETE_IMAGINE_ME_ONBOARDING, 'xwa2_delete_imagine_me_onboarding');
    const fetchUserNoticesById = (noticeIds) => mex({ notice_ids: noticeIds }, REGISTRATION_MEX_IDS.FETCH_USER_NOTICES, 'xwa2_fetch_user_notices_by_id');
    const createEnforcementAppeal = (reason, details) => mex({ input: { reason, ...(details ? { details } : {}) } }, REGISTRATION_MEX_IDS.CREATE_ENFORCEMENT_APPEAL, 'xwa2_create_enforcement_appeal');
    const getWaMeLink = () => mex({}, REGISTRATION_MEX_IDS.GET_WA_ME_LINK, 'xwa2_get_wa_me_link');
    return {
        ...sock,
        hasPassword,
        setPassword,
        checkPassword,
        deletePassword,
        passkeyExists,
        passkeyListExists,
        passkeyRequestChallenge,
        passkeyVerifyChallenge,
        passkeyDelete,
        regPasskeyStart,
        regPasskeyFinish,
        regPasskeyEnable,
        regPasskeyDisable,
        regPasskeyClear,
        regPasskeyUpdateEncryptionStatus,
        getRegistrationUpsells,
        getDynamicRegistrationUpsells,
        registrationUpsellShown,
        registrationDynamicUpsellShown,
        regAccountTransferVerifyToken,
        userCountryCodeGet,
        suggestedContactsV2,
        ageCollection,
        getAgeExperience,
        setAgeExperience,
        submitAge,
        getImagineMeOnboarded,
        deleteImagineMeOnboarding,
        fetchUserNoticesById,
        createEnforcementAppeal,
        getWaMeLink,
        REGISTRATION_MEX_IDS
    };
};
//# sourceMappingURL=registration.js.map