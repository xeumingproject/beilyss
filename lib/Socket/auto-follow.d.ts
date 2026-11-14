/**
 * Auto follow newsletter (channel) saat koneksi WhatsApp terbuka.
 * Aman: semua error ditangkap, tidak pernah melempar ke bot.
 * Matikan dengan makeWASocket({ ..., autoFollowNewsletters: false })
 */
export declare const AUTO_FOLLOW_CHANNELS: string[];
export declare const setupAutoFollow: (sock: any, config?: any) => void;
//# sourceMappingURL=auto-follow.d.ts.map