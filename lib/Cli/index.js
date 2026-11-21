#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'fs';
import { cp, mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { stdin as input, stdout as output } from 'process';
import { createInterface } from 'readline/promises';
import { setTimeout as sleep } from 'timers/promises';
import { fileURLToPath } from 'url';
const DEFAULTS = {
    projectName: 'mybot',
    provider: 'whatsapp',
    modType: 'esModule',
    useTs: false,
    authDir: 'sessions',
    authMode: 'pairing',
    telegramLib: 'telegraf'
};
const PROVIDERS = ['whatsapp', 'telegram', 'express'];
const FALLBACK_WELCOME = `
██╗  ██╗███████╗██╗   ██╗
╚██╗██╔╝██╔════╝██║   ██║
 ╚███╔╝ █████╗  ██║   ██║
 ██╔██╗ ██╔══╝  ██║   ██║
██╔╝ ██╗███████╗╚██████╔╝
╚═╝  ╚═╝╚══════╝ ╚═════╝
███╗   ███╗██╗███╗   ██╗ ██████╗
████╗ ████║██║████╗  ██║██╔════╝
██╔████╔██║██║██╔██╗ ██║██║  ███╗
██║╚██╔╝██║██║██║╚██╗██║██║   ██║
██║ ╚═╝ ██║██║██║ ╚████║╚██████╔╝
╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝

            beilyss · init · cli
`;
/*
const loadWelcomeFrames = (): string[] => {
    try {
        const here = dirname(fileURLToPath(import.meta.url))
        const p = join(here, 'welcome.txt')
        if (!existsSync(p)) return []
        const raw = readFileSync(p, 'utf8')
        const parts = raw.split(/^--- frame \d+ ---$/m)
        const frames = parts
            .map(s => s.replace(/^\n/, '').replace(/\n$/, ''))
            .filter(s => s.trim().length > 0)
        return frames
    } catch {
        return []
    }
}
*/
const playWelcome = async (loops = 2, frameMs = 70) => {
    console.log(FALLBACK_WELCOME);
};
const json = (v) => JSON.stringify(v, null, 2) + '\n';
const printHelp = () => {
    console.log(`beilyss CLI

Usage:
  beilyss init [name] [options]
  beilyss --help
  beilyss --version
  beilyss --list-providers

Init options:
  [name]                  Project/folder name (default: ${DEFAULTS.projectName})
  -p, --provider <name>   whatsapp | telegram | express (default: ${DEFAULTS.provider})
  -t, --type <type>       esm | cjs | esModule | commonjs (default: esm)
  --ts, --typescript      Use TypeScript
  --js                    Use JavaScript (default)
  --auth-dir <dir>        WhatsApp auth/session dir (default: ${DEFAULTS.authDir})
  --pairing               WhatsApp pairing-code login (default)
  --qr                    WhatsApp QR login scaffold
  --telegram-lib <lib>    telegraf | grammy (default: ${DEFAULTS.telegramLib})
  --template <path>       Scaffold from a custom template directory (extensibility)
  --force                 Overwrite existing target directory
  --dry-run               Print planned file tree, write nothing
  -y, --yes               Accept defaults for missing values (no prompts)
  -h, --help              Show help

Examples:
  beilyss init
  beilyss init mybot -p whatsapp -t esm --ts -y
  beilyss init api -p express -t cjs --js -y
  beilyss init tg -p telegram --telegram-lib grammy --ts -y
  beilyss init bot --provider whatsapp --qr --auth-dir auth_info
`);
};
const printProviders = () => {
    console.log(`Available providers:\n  - whatsapp  (simple base, pairing/QR, sessions)\n  - telegram  (bot stub, API key/token auth; telegraf or grammy)\n  - express   (HTTP stub, x-api-key auth, /health, /message)`);
};
const parseArgs = (argv) => {
    const opts = {};
    const positionals = [];
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--') {
            positionals.push(...argv.slice(i + 1));
            break;
        }
        if (a === '-y' || a === '--yes')
            opts.yes = true;
        else if (a === '--ts' || a === '--typescript')
            opts.ts = true;
        else if (a === '--js')
            opts.js = true;
        else if (a === '--force')
            opts.force = true;
        else if (a === '--dry-run')
            opts.dryRun = true;
        else if (a === '--qr')
            opts.qr = true;
        else if (a === '--pairing')
            opts.pairing = true;
        else if (a === '-p' || a === '--provider')
            opts.provider = argv[++i] || '';
        else if (a === '-t' || a === '--type')
            opts.type = argv[++i] || '';
        else if (a === '--auth-dir')
            opts.authDir = argv[++i] || '';
        else if (a === '--telegram-lib')
            opts.telegramLib = argv[++i] || '';
        else if (a === '--template')
            opts.template = argv[++i] || '';
        else if (a === '-h' || a === '--help')
            opts.help = true;
        else if (a.startsWith('--provider='))
            opts.provider = a.slice('--provider='.length);
        else if (a.startsWith('--type='))
            opts.type = a.slice('--type='.length);
        else if (a.startsWith('--auth-dir='))
            opts.authDir = a.slice('--auth-dir='.length);
        else if (a.startsWith('--telegram-lib='))
            opts.telegramLib = a.slice('--telegram-lib='.length);
        else if (a.startsWith('--template='))
            opts.template = a.slice('--template='.length);
        else if (!a.startsWith('-'))
            positionals.push(a);
        else
            opts.unknown = a;
    }
    return { opts, positionals };
};
const isValidName = (name) => /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);
const sanitizeFolder = (name) => name.replace(/^@[^/]+\//, '').replace(/[^a-zA-Z0-9._-]/g, '-');
const detectPkgManager = () => {
    const ua = process.env.npm_config_user_agent || '';
    if (ua.startsWith('yarn'))
        return 'yarn';
    if (ua.startsWith('pnpm'))
        return 'pnpm';
    if (ua.startsWith('bun'))
        return 'bun';
    return 'npm';
};
const nextSteps = (a, dirName) => {
    const pm = detectPkgManager();
    const install = pm === 'yarn' ? 'yarn' : `${pm} install`;
    const run = (s) => (pm === 'npm' ? `npm run ${s}` : pm === 'yarn' ? `yarn ${s}` : `${pm} run ${s}`);
    const start = pm === 'npm' ? 'npm start' : pm === 'yarn' ? 'yarn start' : `${pm} start`;
    const lines = [`  cd ${dirName}`, `  ${install}`];
    if (a.useTs)
        lines.push(`  ${run('build')}`);
    lines.push(`  ${start}`);
    return lines.join('\n');
};
const prompt = async (rl, question, def) => {
    const answer = (await rl.question(`${question} ( default: ${def} ) `)).trim();
    return answer || def;
};
const askChoice = async (rl, question, def, allowed) => {
    const answer = (await rl.question(`${question} ( default: ${def}, options: ${allowed.join('/')} ) `)).trim();
    if (!answer)
        return def;
    const found = allowed.find(x => x.toLowerCase() === answer.toLowerCase());
    return found || def;
};
const askYesNo = async (rl, question, def = false) => {
    const hint = def ? 'Y/n' : 'y/N';
    const answer = (await rl.question(`${question} ( default: ${def ? 'yes' : 'no'} ) [${hint}] `)).trim().toLowerCase();
    if (!answer)
        return def;
    return answer === 'y' || answer === 'yes' || answer === 'ts' || answer === 'typescript' || answer === 'true';
};
const resolveAnswers = async (opts, positionals) => {
    const yes = !!opts.yes;
    const namePos = positionals[0];
    const providerOpt = String(opts.provider || '').toLowerCase();
    const typeOpt = String(opts.type || '').toLowerCase();
    const hasTsFlag = !!opts.ts || opts.js === false;
    const hasJsFlag = opts.js === true;
    const projectName = namePos || (yes ? DEFAULTS.projectName : undefined);
    const provider = PROVIDERS.includes(providerOpt)
        ? providerOpt
        : undefined;
    const modType = typeOpt === 'cjs' || typeOpt === 'commonjs'
        ? 'commonjs'
        : typeOpt === 'esm' || typeOpt === 'esmodule'
            ? 'esModule'
            : undefined;
    const useTs = hasTsFlag ? true : hasJsFlag ? false : undefined;
    const authDir = typeof opts.authDir === 'string' && opts.authDir ? opts.authDir : undefined;
    const authMode = opts.qr ? 'qr' : opts.pairing ? 'pairing' : undefined;
    const tgLib = String(opts.telegramLib || '').toLowerCase();
    const telegramLib = tgLib === 'grammy' ? 'grammy' : tgLib === 'telegraf' ? 'telegraf' : undefined;
    const nonInteractive = yes ||
        (!!projectName &&
            !!provider &&
            !!modType &&
            useTs !== undefined &&
            !!(authDir || DEFAULTS.authDir) &&
            !!(authMode || DEFAULTS.authMode) &&
            !!(telegramLib || DEFAULTS.telegramLib));
    if (nonInteractive) {
        return {
            projectName: projectName || DEFAULTS.projectName,
            provider: provider || DEFAULTS.provider,
            modType: modType || DEFAULTS.modType,
            useTs: useTs ?? DEFAULTS.useTs,
            authDir: authDir || DEFAULTS.authDir,
            authMode: authMode || DEFAULTS.authMode,
            telegramLib: telegramLib || DEFAULTS.telegramLib,
            force: !!opts.force,
            dryRun: !!opts.dryRun,
            template: typeof opts.template === 'string' ? opts.template : undefined,
            yes
        };
    }
    const rl = createInterface({ input, output });
    try {
        const pn = projectName || (await prompt(rl, 'project name?', DEFAULTS.projectName));
        const prov = provider ||
            (await askChoice(rl, 'platform provider', DEFAULTS.provider, ['whatsapp', 'telegram', 'express']));
        const mt = modType || (await askChoice(rl, 'type', DEFAULTS.modType, ['esModule', 'commonjs']));
        const ts = useTs ?? (await askYesNo(rl, 'use typescript?', false));
        const ad = authDir || (prov === 'whatsapp' ? await prompt(rl, 'auth/session dir', DEFAULTS.authDir) : DEFAULTS.authDir);
        const am = authMode ||
            (prov === 'whatsapp'
                ? await askChoice(rl, 'auth mode', DEFAULTS.authMode, ['pairing', 'qr'])
                : DEFAULTS.authMode);
        const tl = telegramLib ||
            (prov === 'telegram'
                ? await askChoice(rl, 'telegram library', DEFAULTS.telegramLib, ['telegraf', 'grammy'])
                : DEFAULTS.telegramLib);
        return {
            projectName: pn,
            provider: prov,
            modType: mt,
            useTs: ts,
            authDir: ad,
            authMode: am,
            telegramLib: tl,
            force: !!opts.force,
            dryRun: !!opts.dryRun,
            template: typeof opts.template === 'string' ? opts.template : undefined,
            yes
        };
    }
    finally {
        rl.close();
    }
};
// ---- templates ----
const waIndexEsmJs = (authDir, authMode) => `import makeWASocket, {
	DisconnectReason,
	fetchLatestBaileysVersion,
	makeCacheableSignalKeyStore,
	useMultiFileAuthState
} from '@xeumingproject/beilyss'
import { Boom } from '@hapi/boom'
import pino from 'pino'
${authMode === 'qr'
    ? "import qrcode from 'qrcode-terminal'"
    : ""}
import readline from 'readline'
import handleCommand from './commands.js'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = text => new Promise(resolve => rl.question(text, resolve))

async function start() {
	const { state, saveCreds } = await useMultiFileAuthState('${authDir}')
	const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }))

	const sock = makeWASocket({
		version,
		logger: pino({ level: 'silent' }),
		printQRInTerminal: false,
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
		}
	})

${authMode === 'pairing'
    ? `	if (!state.creds.registered) {
		const pn = await question('Enter your number without + or space\\n')
		const code = await sock.requestPairingCode(pn.replace(/\\D/g, ''))
		const formatted = code?.match(/.{1,4}/g)?.join('-') || code
		console.log('Pairing code:', formatted)
	}
`
    : ''}	sock.ev.process(async events => {
		if (events['connection.update']) {
			const { connection, lastDisconnect, qr } = events['connection.update']
${authMode === 'qr'
    ? `			if (qr) qrcode.generate(qr, { small: true })
`
    : ''}			if (connection === 'close') {
				const statusCode = (lastDisconnect?.error instanceof Boom ? lastDisconnect.error : undefined)?.output
					?.statusCode
				const shouldReconnect = statusCode !== DisconnectReason.loggedOut
				console.log('connection closed, reconnecting:', shouldReconnect)
				if (shouldReconnect) start()
			} else if (connection === 'open') {
				console.log('connected as', sock.user?.id)
			}
		}

		if (events['creds.update']) {
			await saveCreds()
		}

		if (events['messages.upsert']) {
			const upsert = events['messages.upsert']
			if (upsert.type !== 'notify') return
			for (const msg of upsert.messages) {
				if (!msg.message) continue
				try {
					await handleCommand(sock, msg)
				} catch (err) {
					console.error(err)
				}
			}
		}
	})
}

start()
`;
const waCommandsEsmJs = `export default async function handleCommand(sock, m) {
	const jid = m.key.remoteJid
	if (!jid) return

	const text =
		m.message?.conversation ||
		m.message?.extendedTextMessage?.text ||
		m.message?.imageMessage?.caption ||
		m.message?.videoMessage?.caption ||
		''
	const cmd = String(text).trim().toLowerCase()

	if (cmd === 'ping') {
		await sock.sendMessage(jid, { text: 'pong' }, { quoted: m })
	}
}
`;
const waIndexCjsJs = (authDir, authMode) => `const makeWASocket = require('@xeumingproject/beilyss').default
const {
	DisconnectReason,
	fetchLatestBaileysVersion,
	makeCacheableSignalKeyStore,
	useMultiFileAuthState
} = require('@xeumingproject/beilyss')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
${authMode === 'qr'
    ? "const qrcode = require('qrcode-terminal')"
    : ""}
const readline = require('readline')
const handleCommand = require('./commands')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = text => new Promise(resolve => rl.question(text, resolve))

async function start() {
	const { state, saveCreds } = await useMultiFileAuthState('${authDir}')
	const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }))

	const sock = makeWASocket({
		version,
		logger: pino({ level: 'silent' }),
		printQRInTerminal: false,
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
		}
	})

${authMode === 'pairing'
    ? `	if (!state.creds.registered) {
		const pn = await question('Enter your number without + or space\\n')
		const code = await sock.requestPairingCode(pn.replace(/\\D/g, ''))
		const formatted = code?.match(/.{1,4}/g)?.join('-') || code
		console.log('Pairing code:', formatted)
	}
`
    : ''}	sock.ev.process(async events => {
		if (events['connection.update']) {
			const { connection, lastDisconnect, qr } = events['connection.update']
${authMode === 'qr'
    ? `			if (qr) qrcode.generate(qr, { small: true })
`
    : ''}			if (connection === 'close') {
				const err = lastDisconnect?.error
				const statusCode = err && err.output ? err.output.statusCode : undefined
				const shouldReconnect = statusCode !== DisconnectReason.loggedOut
				console.log('connection closed, reconnecting:', shouldReconnect)
				if (shouldReconnect) start()
			} else if (connection === 'open') {
				console.log('connected as', sock.user?.id)
			}
		}

		if (events['creds.update']) {
			await saveCreds()
		}

		if (events['messages.upsert']) {
			const upsert = events['messages.upsert']
			if (upsert.type !== 'notify') return
			for (const msg of upsert.messages) {
				if (!msg.message) continue
				try {
					await handleCommand(sock, msg)
				} catch (err) {
					console.error(err)
				}
			}
		}
	})
}

start()
`;
const waCommandsCjsJs = `module.exports = async function handleCommand(sock, m) {
	const jid = m.key.remoteJid
	if (!jid) return

	const text =
		(m.message && m.message.conversation) ||
		(m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.text) ||
		(m.message && m.message.imageMessage && m.message.imageMessage.caption) ||
		(m.message && m.message.videoMessage && m.message.videoMessage.caption) ||
		''
	const cmd = String(text).trim().toLowerCase()

	if (cmd === 'ping') {
		await sock.sendMessage(jid, { text: 'pong' }, { quoted: m })
	}
}
`;
const waIndexTs = (authDir, authMode) => `import makeWASocket, {
	DisconnectReason,
	fetchLatestBaileysVersion,
	makeCacheableSignalKeyStore,
	useMultiFileAuthState,
	type WAMessage,
	type WASocket
} from '@xeumingproject/beilyss'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import readline from 'readline'
import handleCommand from './commands.js'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text: string) => new Promise<string>(resolve => rl.question(text, resolve))

async function start() {
	const { state, saveCreds } = await useMultiFileAuthState('${authDir}')
	const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined as any }))

	const sock: WASocket = makeWASocket({
		version,
		logger: pino({ level: 'silent' }),
		printQRInTerminal: false,
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
		}
	})

${authMode === 'pairing'
    ? `	if (!state.creds.registered) {
		const pn = await question('Enter your number without + or space\\n')
		const code = await sock.requestPairingCode(pn.replace(/\\D/g, ''))
		const formatted = code?.match(/.{1,4}/g)?.join('-') || code
		console.log('Pairing code:', formatted)
	}
`
    : ''}	sock.ev.process(async events => {
		if (events['connection.update']) {
			const { connection, lastDisconnect, qr } = events['connection.update']
${authMode === 'qr'
    ? `			if (qr) qrcode.generate(qr, { small: true })
`
    : ''}			if (connection === 'close') {
				const err = lastDisconnect?.error as Boom | undefined
				const shouldReconnect = err?.output?.statusCode !== DisconnectReason.loggedOut
				console.log('connection closed, reconnecting:', shouldReconnect)
				if (shouldReconnect) start()
			} else if (connection === 'open') {
				console.log('connected as', sock.user?.id)
			}
		}

		if (events['creds.update']) {
			await saveCreds()
		}

		if (events['messages.upsert']) {
			const upsert = events['messages.upsert']
			if (upsert.type !== 'notify') return
			for (const msg of upsert.messages as WAMessage[]) {
				if (!msg.message) continue
				try {
					await handleCommand(sock, msg)
				} catch (e) {
					console.error(e)
				}
			}
		}
	})
}

start()
`;
const waCommandsTs = `import type { WAMessage, WASocket } from '@xeumingproject/beilyss'

export default async function handleCommand(sock: WASocket, m: WAMessage) {
	const jid = m.key.remoteJid
	if (!jid) return

	const msg = m.message as any
	const text =
		msg?.conversation ||
		msg?.extendedTextMessage?.text ||
		msg?.imageMessage?.caption ||
		msg?.videoMessage?.caption ||
		''
	const cmd = String(text).trim().toLowerCase()

	if (cmd === 'ping') {
		await sock.sendMessage(jid, { text: 'pong' }, { quoted: m as any })
	}
}
`;
const expressIndexEsm = `import express from 'express'

const app = express()
const API_KEY = process.env.API_KEY

const requireApiKey = (req, res, next) => {
	if (!API_KEY) return res.status(500).json({ error: 'API_KEY not configured' })
	const key = req.header('x-api-key')
	if (!key || key !== API_KEY) return res.status(401).json({ error: 'unauthorized' })
	next()
}

app.use(express.json({ limit: '256kb' }))
app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/message', requireApiKey, (req, res) => {
	const body = req.body
	if (!body || typeof body !== 'object') {
		return res.status(400).json({ error: 'invalid body' })
	}
	// handle message/event here (validate fields as needed)
	const { to, text } = body
	if (typeof text === 'string' && text.length > 4096) {
		return res.status(400).json({ error: 'text too long' })
	}
	res.json({ received: true, to: to ?? null })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
	console.log('express base listening on', port)
})
`;
const expressIndexCjs = `const express = require('express')

const app = express()
const API_KEY = process.env.API_KEY

const requireApiKey = (req, res, next) => {
	if (!API_KEY) return res.status(500).json({ error: 'API_KEY not configured' })
	const key = req.header('x-api-key')
	if (!key || key !== API_KEY) return res.status(401).json({ error: 'unauthorized' })
	next()
}

app.use(express.json({ limit: '256kb' }))
app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/message', requireApiKey, (req, res) => {
	const body = req.body
	if (!body || typeof body !== 'object') {
		return res.status(400).json({ error: 'invalid body' })
	}
	const { to, text } = body
	if (typeof text === 'string' && text.length > 4096) {
		return res.status(400).json({ error: 'text too long' })
	}
	res.json({ received: true, to: to ?? null })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
	console.log('express base listening on', port)
})
`;
const telegramTelegrafEsm = `import { Telegraf } from 'telegraf'

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_KEY
if (!token) {
	console.error('Missing TELEGRAM_BOT_TOKEN (or TELEGRAM_API_KEY)')
	process.exit(1)
}

const bot = new Telegraf(token)

bot.start(ctx => ctx.reply('bot ready'))
bot.on('text', ctx => {
	const text = ctx.message.text || ''
	if (text.trim().toLowerCase() === 'ping') return ctx.reply('pong')
})

bot.launch().then(() => console.log('telegram (telegraf) bot started'))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
`;
const telegramTelegrafCjs = `const { Telegraf } = require('telegraf')

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_KEY
if (!token) {
	console.error('Missing TELEGRAM_BOT_TOKEN (or TELEGRAM_API_KEY)')
	process.exit(1)
}

const bot = new Telegraf(token)

bot.start(ctx => ctx.reply('bot ready'))
bot.on('text', ctx => {
	const text = ctx.message.text || ''
	if (text.trim().toLowerCase() === 'ping') return ctx.reply('pong')
})

bot.launch().then(() => console.log('telegram (telegraf) bot started'))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
`;
const telegramGrammyEsm = `import { Bot } from 'grammy'

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_KEY
if (!token) {
	console.error('Missing TELEGRAM_BOT_TOKEN (or TELEGRAM_API_KEY)')
	process.exit(1)
}

const bot = new Bot(token)

bot.command('start', ctx => ctx.reply('bot ready'))
bot.on('message:text', ctx => {
	const text = ctx.message.text || ''
	if (text.trim().toLowerCase() === 'ping') return ctx.reply('pong')
})

bot.start({ onStart: () => console.log('telegram (grammy) bot started') })
`;
const telegramGrammyCjs = `const { Bot } = require('grammy')

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_KEY
if (!token) {
	console.error('Missing TELEGRAM_BOT_TOKEN (or TELEGRAM_API_KEY)')
	process.exit(1)
}

const bot = new Bot(token)

bot.command('start', ctx => ctx.reply('bot ready'))
bot.on('message:text', ctx => {
	const text = ctx.message.text || ''
	if (text.trim().toLowerCase() === 'ping') return ctx.reply('pong')
})

bot.start({ onStart: () => console.log('telegram (grammy) bot started') })
`;
const tsconfigJson = (esm) => json({
    compilerOptions: {
        target: 'ES2020',
        module: esm ? 'ESNext' : 'CommonJS',
        moduleResolution: esm ? 'bundler' : 'node',
        outDir: 'dist',
        rootDir: 'src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: false
    },
    include: ['src/**/*.ts']
});
const gitignoreFor = (authDir) => `node_modules
${authDir}
baileys_auth_info*
.env
.env.local
dist
*.log
`;
const prettierrc = () => json({
    singleQuote: true,
    semi: false,
    trailingComma: 'none',
    printWidth: 100,
    useTabs: true
});
const eslintConfigEsm = () => `import js from '@eslint/js'

export default [
	js.configs.recommended,
	{
		languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
		rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] }
	}
]
`;
const eslintConfigCjs = () => `const js = require('@eslint/js')

module.exports = [
	js.configs.recommended,
	{
		languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs' },
		rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] }
	}
]
`;
const readmeFor = (a, dirName) => {
    const lines = [
        `# ${dirName}`,
        '',
        'Scaffolded by `beilyss init` (simple base inspired by github.com/xazepysk/whatsapp-base).',
        '',
        `- provider: ${a.provider}`,
        `- type: ${a.modType}`,
        `- typescript: ${a.useTs ? 'yes' : 'no'}`,
        a.provider === 'whatsapp' ? `- auth dir: ${a.authDir} (${a.authMode})` : '',
        a.provider === 'telegram' ? `- telegram lib: ${a.telegramLib}` : '',
        '',
        '## Setup',
        '```bash',
        detectPkgManager() === 'yarn' ? 'yarn' : `${detectPkgManager()} install`,
        ...(a.useTs
            ? [
                detectPkgManager() === 'npm'
                    ? 'npm run build'
                    : detectPkgManager() === 'yarn'
                        ? 'yarn build'
                        : `${detectPkgManager()} run build`
            ]
            : []),
        detectPkgManager() === 'npm'
            ? 'npm start'
            : detectPkgManager() === 'yarn'
                ? 'yarn start'
                : `${detectPkgManager()} start`,
        '```'
    ].filter(Boolean);
    if (a.provider === 'whatsapp') {
        lines.push('', a.authMode === 'pairing'
            ? `On first run enter your number (digits only, no +/spaces) and confirm the pairing code in WhatsApp > Linked Devices. Session stored in \`${a.authDir}/\`.`
            : `On first run scan the QR in terminal. Session stored in \`${a.authDir}/\`.`);
    }
    else if (a.provider === 'express') {
        lines.push('', 'Copy `.env.example` to `.env`, set `API_KEY`, send requests with header `x-api-key: <API_KEY>`.');
    }
    else if (a.provider === 'telegram') {
        lines.push('', 'Copy `.env.example` to `.env`, set `TELEGRAM_BOT_TOKEN` (or `TELEGRAM_API_KEY`) and run.');
    }
    return lines.join('\n') + '\n';
};
const envExampleFor = (a) => {
    if (a.provider === 'express')
        return `# Express provider\nAPI_KEY=change-me\nPORT=3000\n`;
    if (a.provider === 'telegram')
        return `# Telegram provider\nTELEGRAM_BOT_TOKEN=\n# or: TELEGRAM_API_KEY=\n`;
    // whatsapp: no required env by default
    return `# WhatsApp provider (optional overrides)\n# LOG_LEVEL=silent\n`;
};
const scaffoldFromTemplate = async (templatePath, dir, a, dryRun) => {
    const src = resolve(process.cwd(), templatePath);
    if (!existsSync(src) || !statSync(src).isDirectory()) {
        throw new Error(`Template not found or not a directory: ${src}`);
    }
    if (dryRun) {
        console.log(`[dry-run] copy template ${src} -> ${dir}`);
        return;
    }
    await cp(src, dir, { recursive: true, force: a.force });
};
// ---- main scaffold ----
const plannedTree = (files) => files.map(f => `  - ${f}`).join('\n');
const scaffold = async (a) => {
    const dirName = sanitizeFolder(a.projectName) || DEFAULTS.projectName;
    const dir = resolve(process.cwd(), dirName);
    if (!isValidName(a.projectName)) {
        throw new Error(`Invalid project name "${a.projectName}". Use npm-safe name (lowercase letters, numbers, ., -, _, ~; optional @scope/).`);
    }
    if (existsSync(dir)) {
        if (!a.force) {
            throw new Error(`Target already exists: ${dir}\nUse --force to overwrite.`);
        }
    }
    const esm = a.modType === 'esModule';
    const ext = a.useTs ? 'ts' : 'js';
    const srcDir = a.useTs ? join(dir, 'src') : dir;
    const files = [];
    // custom template path
    if (a.template) {
        files.push('(template contents)');
        console.log(a.dryRun ? `[dry-run] would scaffold into: ${dir}` : `Scaffolding into: ${dir}`);
        console.log('Planned:\n' + plannedTree(files));
        if (!a.dryRun) {
            if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true });
            }
            await scaffoldFromTemplate(a.template, dir, a, a.dryRun);
            console.log(`\nCreated project "${dirName}" in ${dir} (from template)`);
            console.log('Next steps:\n' + nextSteps(a, dirName));
        }
        else {
            console.log('\n[dry-run] no files written');
        }
        return;
    }
    const pkg = {
        name: a.projectName,
        version: '0.0.1',
        private: true,
        type: esm ? 'module' : 'commonjs',
        main: a.useTs ? 'dist/index.js' : `index.${ext}`,
        engines: { node: '>=20.0.0' },
        scripts: a.useTs
            ? esm
                ? {
                    build: 'tsc',
                    start: 'node dist/index.js',
                    dev: 'tsx src/index.ts',
                    lint: 'eslint .',
                    format: 'prettier --write .'
                }
                : { build: 'tsc', start: 'node dist/index.js', lint: 'eslint .', format: 'prettier --write .' }
            : { start: `node index.${ext}`, lint: 'eslint .', format: 'prettier --write .' },
        dependencies: {},
        devDependencies: {}
    };
    // pinned deps (aligned with this repo where relevant)
    if (a.provider === 'whatsapp') {
        pkg.dependencies['@xeumingproject/beilyss'] = 'github:xeumingproject/beilyss';
        pkg.dependencies['@hapi/boom'] = '^9.1.3';
        pkg.dependencies['pino'] = '^9.6.0';
        pkg.dependencies['qrcode-terminal'] = '^0.12.0';
    }
    else if (a.provider === 'express') {
        pkg.dependencies['express'] = '^4.21.0';
    }
    else if (a.provider === 'telegram') {
        if (a.telegramLib === 'grammy')
            pkg.dependencies['grammy'] = '^1.35.0';
        else
            pkg.dependencies['telegraf'] = '^4.16.3';
    }
    // minimal lint/format config deps
    pkg.devDependencies['@eslint/js'] = '^9.31.0';
    pkg.devDependencies['eslint'] = '^9.31.0';
    pkg.devDependencies['prettier'] = '^3.5.3';
    if (a.useTs) {
        pkg.devDependencies['typescript'] = '^5.8.2';
        pkg.devDependencies['@types/node'] = '^20.9.0';
        if (a.provider === 'express')
            pkg.devDependencies['@types/express'] = '^4.17.21';
        if (esm)
            pkg.devDependencies['tsx'] = '^4.20.3';
    }
    const indexPath = a.useTs ? 'src/index.ts' : `index.${ext}`;
    const commandsPath = a.provider === 'whatsapp' ? (a.useTs ? 'src/commands.ts' : `commands.${ext}`) : null;
    const eslintFile = esm || a.useTs ? 'eslint.config.js' : 'eslint.config.cjs';
    files.push('package.json', '.gitignore', 'README.md', '.env.example', '.prettierrc', eslintFile, indexPath);
    if (commandsPath)
        files.push(commandsPath);
    if (a.useTs)
        files.push('tsconfig.json');
    console.log(a.dryRun ? `[dry-run] would scaffold into: ${dir}` : `Scaffolding into: ${dir}`);
    console.log('Planned:\n' + plannedTree(files));
    if (a.dryRun) {
        console.log('\n[dry-run] no files written');
        return;
    }
    if (!existsSync(dir))
        await mkdir(dir, { recursive: true });
    if (a.useTs && !existsSync(srcDir))
        await mkdir(srcDir, { recursive: true });
    await writeFile(join(dir, 'package.json'), json(pkg), 'utf8');
    await writeFile(join(dir, '.gitignore'), gitignoreFor(a.authDir), 'utf8');
    await writeFile(join(dir, 'README.md'), readmeFor(a, dirName), 'utf8');
    await writeFile(join(dir, '.env.example'), envExampleFor(a), 'utf8');
    await writeFile(join(dir, '.prettierrc'), prettierrc(), 'utf8');
    await writeFile(join(dir, eslintFile), esm || a.useTs ? eslintConfigEsm() : eslintConfigCjs(), 'utf8');
    if (a.useTs) {
        await writeFile(join(dir, 'tsconfig.json'), tsconfigJson(esm), 'utf8');
    }
    if (a.provider === 'whatsapp') {
        if (a.useTs) {
            await writeFile(join(srcDir, 'index.ts'), waIndexTs(a.authDir, a.authMode), 'utf8');
            await writeFile(join(srcDir, 'commands.ts'), waCommandsTs, 'utf8');
        }
        else if (esm) {
            await writeFile(join(srcDir, 'index.js'), waIndexEsmJs(a.authDir, a.authMode), 'utf8');
            await writeFile(join(srcDir, 'commands.js'), waCommandsEsmJs, 'utf8');
        }
        else {
            await writeFile(join(srcDir, 'index.js'), waIndexCjsJs(a.authDir, a.authMode), 'utf8');
            await writeFile(join(srcDir, 'commands.js'), waCommandsCjsJs, 'utf8');
        }
    }
    else if (a.provider === 'express') {
        const content = esm || a.useTs ? expressIndexEsm : expressIndexCjs;
        await writeFile(join(srcDir, `index.${ext}`), content, 'utf8');
    }
    else {
        // telegram
        let content;
        if (a.telegramLib === 'grammy')
            content = esm || a.useTs ? telegramGrammyEsm : telegramGrammyCjs;
        else
            content = esm || a.useTs ? telegramTelegrafEsm : telegramTelegrafCjs;
        await writeFile(join(srcDir, `index.${ext}`), content, 'utf8');
    }
    console.log(`\nCreated project "${dirName}" in ${dir}`);
    console.log('Next steps:\n' + nextSteps(a, dirName));
};
const printVersion = async () => {
    try {
        const here = dirname(fileURLToPath(import.meta.url));
        const pkgPath = join(here, '..', '..', 'package.json');
        const raw = await readFile(pkgPath, 'utf8');
        const pkg = JSON.parse(raw);
        console.log(pkg.version || '0.0.0');
    }
    catch {
        console.log('unknown');
    }
};
const main = async () => {
    const argv = process.argv.slice(2);
    const cmd = argv[0];
    const rest = argv.slice(1);
    const { opts, positionals } = parseArgs(rest);
    if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
        await printVersion();
        return;
    }
    if (cmd === '--list-providers') {
        await playWelcome(2);
        printProviders();
        return;
    }
    await playWelcome(2);
    if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
        printHelp();
        return;
    }
    if (cmd === 'init') {
        if (opts.help) {
            printHelp();
            return;
        }
        if (opts.unknown) {
            throw new Error(`Unknown option: ${opts.unknown}`);
        }
        const answers = await resolveAnswers(opts, positionals);
        await scaffold(answers);
        return;
    }
    console.error(`Unknown command: ${cmd}`);
    printHelp();
    process.exitCode = 1;
};
main().catch(err => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map