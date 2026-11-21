/**
 * Banner ASCII XEU MING.
 * - Tampil SEKALI per proses, begitu library di-load (require / import)
 *   dan sebagai cadangan saat makeWASocket() dipanggil.
 * - Matikan dengan environment variable: BEILYSS_NO_BANNER=1
 *   (atau makeWASocket({ showBanner: false }) selama banner belum tampil)
 * - Tidak pernah melempar error ke bot.
 */
export declare const BEILYSS_VERSION = "7.1.0";
export declare const showBanner: (config?: object) => void;
//# sourceMappingURL=banner.d.ts.map