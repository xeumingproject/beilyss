const { loadBaileys, createSocket } = require('./');

async function main() {
    const baileys = await loadBaileys();

    console.log('Beilyss berhasil dimuat!');
    console.log(typeof baileys.makeWASocket);
}

main().catch(console.error);
