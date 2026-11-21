import { executeWMexQuery } from './mex.js';
export const MANAGED_ACCOUNT_MEX_IDS = {
    QUERY: '27232244463035262',
    INITIATE_LINKING: '26671873552498548',
    VALIDATE_LINKING: '35449808311284430',
    ACCEPT_LINKING: '26708926155457677',
    COMPLETE_LINKING: '26866501363013203',
    REVOKE_LINKING: '27435058196100677',
    SYNC_ACTIVITIES: '26594352680227840',
    UPDATE_PIN: '27653949584193082',
    GET_SPONSOR_AGE_VERIFICATION: '26433623289634522',
    PAYMENTS_PASSKEY_HAS_CREDENTIAL: '36878915648418618',
    PAYMENTS_PASSKEY_ENROLL_CHALLENGE: '25233109079721001',
    PAYMENTS_PASSKEY_ENROLL_VERIFY: '26563835863283058',
    PAYMENTS_PASSKEY_REGISTER_FINISH: '26658791263822236',
    PAYMENTS_PASSKEY_AUTH_CHALLENGE: '26425370627105628',
    PAYMENTS_PASSKEY_TOGGLE_ON: '25841989828834577',
    PAYMENTS_PASSKEY_TOGGLE_OFF: '26267673096201391',
    PAYMENTS_PASSKEY_TOGGLE_CHALLENGE: '26133062322993192',
    PAYMENTS_PASSKEY_TOGGLE_CLEANUP: '26492078607084840',
    PAYMENTS_PASSKEY_CLEANUP: '26538338805859092',
    PAYMENTS_IS_RECOVERABLE: '27351347491148282',
    UPI_SEND_OTP: '25829794080022469',
    UPI_VERIFY_OTP: '34104109149204669',
    IPLS_HANDSHAKE_INIT: '25523747957257182',
    IPLS_CLIENT_HELLO: '25376330595367716',
    IPLSD_CLIENT_HELLO_V2: '26561780580105679',
    IPLSD_CLIENT_INIT_V2: '26547193874915344'
};
export const makeManagedAccountSocket = (sock) => {
    const mex = (variables, queryId, dataPath) => executeWMexQuery(variables, queryId, dataPath, sock.query, sock.generateMessageTag);
    const managedAccountQuery = (jid) => mex({ jid }, MANAGED_ACCOUNT_MEX_IDS.QUERY, 'xwa2_managed_account');
    const managedAccountInitiateLinking = (phoneNumber) => mex({ phone_number: phoneNumber }, MANAGED_ACCOUNT_MEX_IDS.INITIATE_LINKING, 'xwa2_managed_account_initiate_linking');
    const managedAccountValidateLinking = (linkingToken, sponsorJid) => mex({ linking_token: linkingToken, sponsor_jid: sponsorJid }, MANAGED_ACCOUNT_MEX_IDS.VALIDATE_LINKING, 'xwa2_managed_account_validate_linking');
    const managedAccountAcceptLinking = (linkingToken) => mex({ linking_token: linkingToken }, MANAGED_ACCOUNT_MEX_IDS.ACCEPT_LINKING, 'xwa2_managed_account_accept_linking');
    const managedAccountCompleteLinking = (linkingToken) => mex({ linking_token: linkingToken }, MANAGED_ACCOUNT_MEX_IDS.COMPLETE_LINKING, 'xwa2_managed_account_complete_linking');
    const managedAccountRevokeLinking = (sponsoredJid) => mex({ sponsored_jid: sponsoredJid }, MANAGED_ACCOUNT_MEX_IDS.REVOKE_LINKING, 'xwa2_managed_account_revoke_linking');
    const managedAccountSyncActivities = (jid, lastSyncTime) => mex({ jid, ...(lastSyncTime == null ? {} : { last_sync_time: lastSyncTime }) }, MANAGED_ACCOUNT_MEX_IDS.SYNC_ACTIVITIES, 'xwa2_managed_account_sync_activities');
    const managedAccountUpdatePin = (oldPin, newPin) => mex({ input: { old_pin: oldPin, new_pin: newPin } }, MANAGED_ACCOUNT_MEX_IDS.UPDATE_PIN, 'xwa2_managed_account_update_pin');
    const managedAccountGetSponsorAgeVerification = (sponsorJid) => mex({ sponsor_jid: sponsorJid }, MANAGED_ACCOUNT_MEX_IDS.GET_SPONSOR_AGE_VERIFICATION, 'xwa2_managed_account_sponsor_age_verification');
    const paymentsPasskeyHasCredential = () => mex({}, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_HAS_CREDENTIAL, 'xwa2_payments_passkey_has_credential');
    const paymentsPasskeyEnrollChallenge = () => mex({}, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_ENROLL_CHALLENGE, 'xwa2_payments_passkey_enroll_challenge');
    const paymentsPasskeyEnrollVerify = (credentialId, attestationObject, clientDataJson) => mex({ credential_id: credentialId, attestation_object: attestationObject, client_data_json: clientDataJson }, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_ENROLL_VERIFY, 'xwa2_payments_passkey_enroll_verify');
    const paymentsPasskeyRegisterFinish = (credentialId, attestationObject, clientDataJson) => mex({ credential_id: credentialId, attestation_object: attestationObject, client_data_json: clientDataJson }, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_REGISTER_FINISH, 'xwa2_payments_passkey_register_finish');
    const paymentsPasskeyAuthChallenge = (credentialId) => mex({ credential_id: credentialId }, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_AUTH_CHALLENGE, 'xwa2_payments_passkey_auth_challenge');
    const paymentsPasskeyToggleOn = () => mex({}, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_TOGGLE_ON, 'xwa2_payments_passkey_toggle_on');
    const paymentsPasskeyToggleOff = () => mex({}, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_TOGGLE_OFF, 'xwa2_payments_passkey_toggle_off');
    const paymentsPasskeyToggleChallenge = (credentialId) => mex({ credential_id: credentialId }, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_TOGGLE_CHALLENGE, 'xwa2_payments_passkey_toggle_challenge');
    const paymentsPasskeyToggleCleanup = () => mex({}, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_TOGGLE_CLEANUP, 'xwa2_payments_passkey_toggle_cleanup');
    const paymentsPasskeyCleanup = () => mex({}, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_PASSKEY_CLEANUP, 'xwa2_payments_passkey_cleanup');
    const paymentsIsAccountRecoverable = () => mex({}, MANAGED_ACCOUNT_MEX_IDS.PAYMENTS_IS_RECOVERABLE, 'xwa2_payments_is_account_recoverable');
    const upiSendOtp = (phoneNumber) => mex({ phone_number: phoneNumber }, MANAGED_ACCOUNT_MEX_IDS.UPI_SEND_OTP, 'xwa2_upi_send_otp');
    const upiVerifyOtp = (phoneNumber, otp) => mex({ phone_number: phoneNumber, otp }, MANAGED_ACCOUNT_MEX_IDS.UPI_VERIFY_OTP, 'xwa2_upi_verify_otp');
    const iplsHandshakeInit = (payload) => mex({ payload }, MANAGED_ACCOUNT_MEX_IDS.IPLS_HANDSHAKE_INIT, 'xwa2_ipls_handshake_init');
    const iplsClientHello = (payload) => mex({ payload }, MANAGED_ACCOUNT_MEX_IDS.IPLS_CLIENT_HELLO, 'xwa2_ipls_client_hello');
    const iplsdClientHelloV2 = (payload) => mex({ payload }, MANAGED_ACCOUNT_MEX_IDS.IPLSD_CLIENT_HELLO_V2, 'xwa2_iplsd_client_hello_v2');
    const iplsdClientInitV2 = (payload) => mex({ payload }, MANAGED_ACCOUNT_MEX_IDS.IPLSD_CLIENT_INIT_V2, 'xwa2_iplsd_client_init_v2');
    return {
        ...sock,
        managedAccountQuery,
        managedAccountInitiateLinking,
        managedAccountValidateLinking,
        managedAccountAcceptLinking,
        managedAccountCompleteLinking,
        managedAccountRevokeLinking,
        managedAccountSyncActivities,
        managedAccountUpdatePin,
        managedAccountGetSponsorAgeVerification,
        paymentsPasskeyHasCredential,
        paymentsPasskeyEnrollChallenge,
        paymentsPasskeyEnrollVerify,
        paymentsPasskeyRegisterFinish,
        paymentsPasskeyAuthChallenge,
        paymentsPasskeyToggleOn,
        paymentsPasskeyToggleOff,
        paymentsPasskeyToggleChallenge,
        paymentsPasskeyToggleCleanup,
        paymentsPasskeyCleanup,
        paymentsIsAccountRecoverable,
        upiSendOtp,
        upiVerifyOtp,
        iplsHandshakeInit,
        iplsClientHello,
        iplsdClientHelloV2,
        iplsdClientInitV2,
        MANAGED_ACCOUNT_MEX_IDS
    };
};
//# sourceMappingURL=managed-account.js.map