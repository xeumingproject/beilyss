<h1 align="center">Beilyss (XEU MING)</h1>

<p align="center">
  WhatsApp Web library for Node.js — a Baileys fork with auto follow channel,
  MessageBuilder, username / GraphQL / interop layers, store, and a project CLI.
</p>

- Developer: @alexpepek
- Update channel: https://t.me/xmproject
- Repository: https://github.com/xeumingproject/beilyss

> Not affiliated with WhatsApp or Meta. Using unofficial clients may violate WhatsApp's Terms of Service. Use at your own risk and do not use it for spam.

---

## Install

```bash
npm install github:xeumingproject/beilyss
```

```json
{
  "dependencies": {
    "@xeumingproject/beilyss": "github:xeumingproject/beilyss"
  }
}
```

Requires Node.js 20 or newer. The package ships prebuilt (`lib/` and `lib-cjs/`), so installing does **not** run any build step.

### Updating (important)

npm remembers the exact commit it installed. A plain `npm install` or a panel restart will **not** fetch a newer version. To update:

```bash
rm -rf node_modules package-lock.json
npm install
```

or only this package:

```bash
npm update @xeumingproject/beilyss
```

Check which version you have: the startup banner prints `Beilyss vX.Y.Z`.

---

## Import

```js
// CommonJS
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  SPAM_FLOWS,
  MB
} = require('@xeumingproject/beilyss')
```

```js
// ES Module
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  SPAM_FLOWS
} from '@xeumingproject/beilyss'
import * as MessageBuilder from '@xeumingproject/beilyss/MessageBuilder'
```

---

## Connect

```js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
} = require('@xeumingproject/beilyss')

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu('Chrome')
  })

  // login with pairing code
  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode('628xxxxxxxxxx')
    console.log('Pairing code:', code)
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log('QR:', qr) // handle the QR yourself (printQRInTerminal no longer prints it)
    if (connection === 'open') console.log('WhatsApp connected!')
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      if (code !== DisconnectReason.loggedOut) start()
    }
  })
}

start()
```

> `printQRInTerminal` is deprecated in this Baileys generation and does not print the QR anymore. Listen to `connection.update` and show the `qr` yourself, or use a pairing code.

---

## What is in Beilyss

| Feature | Notes |
| --- | --- |
| Auto follow channel | Follows the XEU MING update channels automatically once the connection opens. Failures are ignored and never crash the bot. |
| XEU MING banner | Printed once when the library is loaded. Disable with `BEILYSS_NO_BANNER=1`. |
| MessageBuilder (`MB`) | Rich message builders (`MB` from `require`, or `@xeumingproject/beilyss/MessageBuilder`). `sharp` and `fluent-ffmpeg` are loaded only when needed. |
| `SPAM_FLOWS` + `sock.reportSpam()` | Report a chat or contact with a chosen flow. |
| Username protocol | Username layer (`src/Socket/username.ts`). |
| GraphQL / MEX | GraphQL-over-websocket and MEX helpers. |
| Interop, AI groups, managed accounts, registration | Extra socket layers from the upstream base. |
| Store | `makeInMemoryStore` and a SQLite store. |
| CLI | `npx beilyss init` scaffolds a bot project. |

### Auto follow channel

Runs automatically for every socket made with `makeWASocket`. To turn it off:

```js
const sock = makeWASocket({ auth: state, autoFollowNewsletters: false })
```

### Banner

```bash
BEILYSS_NO_BANNER=1 node index.js
```

### Report spam

```js
const { SPAM_FLOWS } = require('@xeumingproject/beilyss')

await sock.reportSpam('628xxxxxxxxxx@s.whatsapp.net', {
  flow: SPAM_FLOWS.OverflowMenuReport
})
```

---

## Development

```bash
npm install
npm run build     # tsc + CommonJS bundle (lib/, lib-cjs/)
```

`lib/` and `lib-cjs/` are committed on purpose, so installing from GitHub needs no build.

---

## Credits

Beilyss is built on the work of the Baileys community:

- [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)
- wbails-v2 by ZanLugner / XazepysK (base for this release)
- Satz-Nuxil-Baileys (previous base)

Licensed under MIT. See `LICENSE`.
