Beilyss

<p align="center">
  <img src="https://d.uguu.se/NRukpeXcrzEZ.jpg" width="100%" alt="Beilyss Banner">
</p><p align="center">
  <b>A Powerful WhatsApp Web API for Node.js</b><br>
  Flexible • Extended • Developer Friendly
</p><p align="center">
  <a href="https://github.com/xeumingproject/beilyss">
    <img src="https://img.shields.io/badge/GitHub-xeumingproject-black?style=flat-square&logo=github">
  </a>
  <img src="https://img.shields.io/badge/Node.js-Required-green?style=flat-square&logo=node.js">
  <img src="https://img.shields.io/badge/Module-CommonJS%20%7C%20ESM-blue?style=flat-square">
</p>---

About

Beilyss is an independent Baileys fork designed for developers who want to build WhatsApp bots, automation systems, and custom messaging applications.

It extends the WhatsApp Web API with additional socket functionality, messaging capabilities, and an integrated Message Builder module.

Features

- WhatsApp Web connection
- QR Code and Pairing Code authentication
- Multi-device support
- Send and receive messages
- Text, image, video, audio, and document messaging
- Poll messages
- Relay messages
- Group and community management
- Newsletter support
- Message Builder ("MB")
- CommonJS and ES Modules
- Block and Unblock API
- Spam Reporting API
- Account Information Report Flow

---

Installation

Install directly from GitHub:

npm install github:xeumingproject/beilyss

package.json

{
  "dependencies": {
    "@xeumingproject/beilyss": "github:xeumingproject/beilyss"
  }
}

---

Import

CommonJS

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  SPAM_FLOWS,
  MB
} = require('@xeumingproject/beilyss');

ES Modules

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  SPAM_FLOWS,
  MB
} from '@xeumingproject/beilyss';

---

Connection

Basic WhatsApp connection example:

const {
  default: makeWASocket,
  useMultiFileAuthState,
  Browsers
} = require('@xeumingproject/beilyss');

async function connectToWhatsApp() {
  const { state, saveCreds } =
    await useMultiFileAuthState('./auth');

  const conn = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu('Safari'),
    printQRInTerminal: false
  });

  conn.ev.on('creds.update', saveCreds);

  conn.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('WhatsApp Connected!');
    }

    if (connection === 'close') {
      console.log('WhatsApp Connection Closed!');
    }
  });

  return conn;
}

connectToWhatsApp();

---

Messaging Documentation

1. Send Text

Send a regular text message using "sendMessage()".

async function sendText(conn, target) {
  await conn.sendMessage(target, {
    text: 'Hello from Beilyss!'
  });
}

2. Send Image

Send an image with a caption.

async function sendImage(conn, target) {
  await conn.sendMessage(target, {
    image: {
      url: 'https://files.catbox.moe/h87kyf.png'
    },
    caption: 'Image sent using Beilyss'
  });
}

You can also send an image from a local file:

async function sendLocalImage(conn, target) {
  await conn.sendMessage(target, {
    image: {
      url: './image.jpg'
    },
    caption: 'Local image'
  });
}

3. Send Poll

Create a WhatsApp poll.

async function sendPoll(conn, target) {
  await conn.sendMessage(target, {
    poll: {
      name: 'Which feature do you prefer?',
      values: [
        'Send Message',
        'Relay Message',
        'Message Builder'
      ],
      selectableCount: 1
    }
  });
}

"selectableCount" determines how many options participants can select.

4. Send Video

async function sendVideo(conn, target) {
  await conn.sendMessage(target, {
    video: {
      url: 'https://example.com/video.mp4'
    },
    caption: 'Video sent using Beilyss'
  });
}

5. Send Audio

async function sendAudio(conn, target) {
  await conn.sendMessage(target, {
    audio: {
      url: './audio.mp3'
    },
    mimetype: 'audio/mpeg'
  });
}

6. Send Document

async function sendDocument(conn, target) {
  await conn.sendMessage(target, {
    document: {
      url: './document.pdf'
    },
    mimetype: 'application/pdf',
    fileName: 'Beilyss.pdf',
    caption: 'Document example'
  });
}

---

Relay Message

"relayMessage()" provides a lower-level way to relay a prepared WhatsApp message payload.

Unlike "sendMessage()", it does not automatically prepare every high-level message type. The payload must use the appropriate WhatsApp message structure.

1. Relay Text

const { randomBytes } = require('crypto');

async function relayText(conn, target) {
  const messageId = randomBytes(11)
    .toString('hex')
    .toUpperCase();

  await conn.relayMessage(
    target,
    {
      extendedTextMessage: {
        text: 'Hello from relayMessage!'
      }
    },
    {
      messageId
    }
  );
}

2. Relay Prepared Message

You can also prepare a message first and relay its message content:

async function relayPreparedMessage(conn, target) {
  const message = {
    extendedTextMessage: {
      text: 'Beilyss Relay Example'
    }
  };

  await conn.relayMessage(target, message, {
    messageId: randomBytes(11).toString('hex').toUpperCase()
  });
}

Import "randomBytes" from Node.js crypto when using this example:

const { randomBytes } = require('crypto');

Important: "relayMessage()" is a lower-level API. For ordinary text, image, poll, and document messages, use "sendMessage()" unless you specifically need to construct and relay a raw WhatsApp message payload.

---

Extended Socket Features

1. Block Contact

await conn.updateBlockStatus(target, 'block');

2. Unblock Contact

await conn.updateBlockStatus(target, 'unblock');

3. Spam Reporting

Submit an individual report using a supported reporting flow:

const { SPAM_FLOWS } = require('@xeumingproject/beilyss');

await conn.reportSpam(target, {
  flow: SPAM_FLOWS.OverflowMenuReport
});

Use reporting functionality responsibly and only for legitimate reports.

4. SPAM_FLOWS

Available flow identifiers:

Name| Value
Block| "block_dialog"
OverflowMenuBlock| "overflow_menu_block"
OverflowMenuReport| "overflow_menu_report"
MediaViewer| "media_viewer"
MessageMenu| "message_menu"
CommunityHome| "community_home"
AccountInfoReport| "account_info_report"
GroupInfoReport| "group_info_report"
GroupSpamBannerReport| "group_spam_banner_report"
OneToOneChatSpamBannerReport| "1_1_spam_banner_report"
BizSpamBannerBlock| "biz_spam_banner_block"
ChatListBlock| "chat_list_block"
NotificationBlock| "notification_block"
StatusPostReport| "status_post_report"
NewsletterInfoReport| "newsletter_info_report"

AccountInfoReport

console.log(SPAM_FLOWS.AccountInfoReport);

Output:

account_info_report

This is a flow identifier, not a separate "accountInfoReport()" socket method.

---

Message Builder

Beilyss includes the "MB" module for building rich WhatsApp messages.

const { MB } = require('@xeumingproject/beilyss');

Use the Message Builder methods available in the installed version.

---

Development

Clone the repository:

git clone https://github.com/xeumingproject/beilyss.git

cd Beilyss

Install dependencies:

npm install

Build the project:

npm run build

---

Project Information

Information| Details
Project| Beilyss
Package| "@xeumingproject/beilyss"
Developer| SatzNuxil
Runtime| Node.js
Module| CommonJS / ESM
Repository| GitHub
Branch| "satznuxil-dev"

Repository

"GitHub - xeumingproject/beilyss" (https://github.com/xeumingproject/beilyss)

---

Disclaimer

Beilyss is an independent community fork and is not affiliated with, endorsed by, or officially supported by WhatsApp or Meta.

Use this library responsibly and comply with applicable terms and laws.

---

<p align="center">
  <b>SATZ NUXIL BAILEYS</b><br>
  Engineered for Developers. Built for Possibilities.<br><br>
  Developed by <b>SatzNuxil</b>
</p>
