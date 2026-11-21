export declare enum XWAPaths {
    xwa2_newsletter_create = "xwa2_newsletter_create",
    xwa2_newsletter_subscribers = "xwa2_newsletter_subscribers",
    xwa2_newsletter_view = "xwa2_newsletter_view",
    xwa2_newsletter_metadata = "xwa2_newsletter",
    xwa2_newsletter_admin_count = "xwa2_newsletter_admin",
    xwa2_newsletter_mute_v2 = "xwa2_newsletter_mute_v2",
    xwa2_newsletter_unmute_v2 = "xwa2_newsletter_unmute_v2",
    xwa2_newsletter_follow = "xwa2_newsletter_follow",
    xwa2_newsletter_unfollow = "xwa2_newsletter_unfollow",
    xwa2_newsletter_join_v2 = "xwa2_newsletter_join_v2",
    xwa2_newsletter_leave_v2 = "xwa2_newsletter_leave_v2",
    xwa2_newsletter_change_owner = "xwa2_newsletter_change_owner",
    xwa2_newsletter_demote = "xwa2_newsletter_demote",
    xwa2_newsletter_delete_v2 = "xwa2_newsletter_delete_v2",
    xwa2_fetch_account_reachout_timelock = "xwa2_fetch_account_reachout_timelock",
    xwa2_message_capping_info = "xwa2_message_capping_info",
    xwa2_username_check = "xwa2_username_check",
    xwa2_username_set = "xwa2_username_set",
    xwa2_username_get = "xwa2_username_get",
    xwa2_username_pin_set = "xwa2_username_pin_set",
    xwa2_username_check_multi = "xwa2_username_check_multi",
    xwa2_username_get_recommendations = "xwa2_username_get_recommendations"
}
export declare enum QueryIds {
    CREATE = "8823471724422422",
    UPDATE_METADATA = "24250201037901610",
    METADATA = "6563316087068696",
    SUBSCRIBERS = "9783111038412085",
    FOLLOW = "24404358912487870",
    UNFOLLOW = "9767147403369991",
    MUTE = "29766401636284406",
    UNMUTE = "9864994326891137",
    ADMIN_COUNT = "7130823597031706",
    CHANGE_OWNER = "7341777602580933",
    DEMOTE = "6551828931592903",
    DELETE = "30062808666639665",
    REACHOUT_TIMELOCK = "23983697327930364",
    MESSAGE_CAPPING_INFO = "24503548349331633",
    USERNAME_CHECK = "26124072630599518",
    USERNAME_CHECK_MULTI = "27134626522840286",
    USERNAME_SET = "27108705368767936",
    USERNAME_GET = "32618050064506055",
    USERNAME_GET_RECOMENDATION = "26077456248616957",
    USERNAME_PIN_SET = "25529696019976770"
}
export type NewsletterUpdate = {
    name?: string;
    description?: string;
    picture?: string;
};
export interface NewsletterCreateResponse {
    id: string;
    state: {
        type: string;
    };
    thread_metadata: {
        creation_time: string;
        description: {
            id: string;
            text: string;
            update_time: string;
        };
        handle: string | null;
        invite: string;
        name: {
            id: string;
            text: string;
            update_time: string;
        };
        picture: {
            direct_path: string;
            id: string;
            type: string;
        };
        preview: {
            direct_path: string;
            id: string;
            type: string;
        };
        subscribers_count: string;
        verification: 'VERIFIED' | 'UNVERIFIED';
    };
    viewer_metadata: {
        mute: 'ON' | 'OFF';
        role: NewsletterViewRole;
    };
}
export type NewsletterViewRole = 'ADMIN' | 'GUEST' | 'OWNER' | 'SUBSCRIBER';
export interface NewsletterMetadata {
    id: string;
    owner?: string;
    name: string;
    description?: string;
    invite?: string;
    creation_time?: number;
    subscribers?: number;
    picture?: {
        url?: string;
        directPath?: string;
        mediaKey?: string;
        id?: string;
    };
    verification?: 'VERIFIED' | 'UNVERIFIED';
    reaction_codes?: {
        code: string;
        count: number;
    }[];
    mute_state?: 'ON' | 'OFF';
    thread_metadata?: {
        creation_time?: number;
        name?: string;
        description?: string;
    };
}
//# sourceMappingURL=Mex.d.ts.map