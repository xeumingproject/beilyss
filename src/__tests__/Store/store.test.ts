import { jest } from '@jest/globals'

jest.mock('node:sqlite', () => require('node:sqlite'))
import { EventEmitter } from 'events'
import { existsSync, rmSync } from 'fs'
import { makeInMemmoryStore, makeInMemoryStore, useJSONAuthState } from '../../Store/in-memory'
import { makeSQLiteStore, useSQLiteAuthState } from '../../Store/sqlite'
import type { BaileysEventEmitter, WAMessage } from '../../Types'

describe('Stores Test Suite', () => {
	const createMockEventEmitter = (): BaileysEventEmitter => {
		const emitter = new EventEmitter()
		const ev: any = {
			on: (event: string, listener: (...args: any[]) => void) => emitter.on(event, listener),
			off: (event: string, listener: (...args: any[]) => void) => emitter.off(event, listener),
			removeAllListeners: (event?: string) => emitter.removeAllListeners(event),
			emit: (event: string, ...args: any[]) => emitter.emit(event, ...args),
			process: async (handler: (events: any) => Promise<void>) => {
				emitter.on('event', handler)
			},
			createBufferedFunction: (work: any) => work,
			flush: async () => true,
			isBuffering: () => false,
			buffer: () => false
		}
		return ev
	}

	describe('makeInMemmoryStore', () => {
		const tempFile = 'test_store.json'
		const tempAuth = 'test_auth.json'

		afterAll(() => {
			if (existsSync(tempFile)) rmSync(tempFile)
			if (existsSync(tempAuth)) rmSync(tempAuth)
		})

		it('aliases makeInMemoryStore correctly', () => {
			expect(makeInMemoryStore).toBe(makeInMemmoryStore)
		})

		it('tracks chats, contacts and messages through bind', async () => {
			const store = makeInMemmoryStore()
			const ev = createMockEventEmitter()
			store.bind(ev)

			ev.emit('chats.upsert', [{ id: '123@s.whatsapp.net', conversationTimestamp: 100 }])
			expect(store.chats.get('123@s.whatsapp.net')).toBeDefined()

			ev.emit('contacts.upsert', [{ id: '123@s.whatsapp.net', name: 'Alice' }])
			expect(store.contacts['123@s.whatsapp.net']?.name).toBe('Alice')

			const msg: WAMessage = {
				key: { remoteJid: '123@s.whatsapp.net', id: 'M1', fromMe: false },
				message: { conversation: 'Hi' },
				messageTimestamp: 100
			}
			ev.emit('messages.upsert', { messages: [msg], type: 'notify' })

			const loaded = await store.loadMessages('123@s.whatsapp.net', 10)
			expect(loaded.length).toBe(1)
			expect(loaded[0]?.key.id).toBe('M1')

			const single = await store.loadMessage('123@s.whatsapp.net', 'M1')
			expect(single?.message?.conversation).toBe('Hi')

			const recent = await store.mostRecentMessage('123@s.whatsapp.net')
			expect(recent?.key.id).toBe('M1')
		})

		it('saves and restores from file', async () => {
			const store = makeInMemmoryStore()
			const ev = createMockEventEmitter()
			store.bind(ev)

			ev.emit('contacts.upsert', [{ id: '456@s.whatsapp.net', name: 'Bob' }])
			await store.writeToFile(tempFile)

			const newStore = makeInMemmoryStore()
			await newStore.readFromFile(tempFile)
			expect(newStore.contacts['456@s.whatsapp.net']?.name).toBe('Bob')
		})

		it('supports useJSONAuthState', async () => {
			const { state, saveCreds } = await useJSONAuthState(tempAuth)
			expect(state.creds).toBeDefined()

			await state.keys.set({
				session: {
					user1: new Uint8Array([1, 2, 3])
				}
			})
			await saveCreds()

			const { state: reloaded } = await useJSONAuthState(tempAuth)
			const retrieved = await reloaded.keys.get('session', ['user1'])
			expect(retrieved['user1']).toBeDefined()
			expect(Buffer.from(retrieved['user1']!)).toEqual(Buffer.from([1, 2, 3]))
		})
	})

	describe('makeSQLiteStore', () => {
		let dbSupported = true
		try {
			require('node:sqlite')
		} catch {
			dbSupported = false
		}

		if (!dbSupported) {
			it.skip('creates an in-memory SQLite store and binds events', () => {})
			return
		}

		it('creates an in-memory SQLite store and binds events', async () => {
			const store = makeSQLiteStore({ location: ':memory:' })
			const ev = createMockEventEmitter()
			store.bind(ev)

			ev.emit('chats.upsert', [{ id: 'chat1@s.whatsapp.net', conversationTimestamp: 200 }])
			expect(store.getChat('chat1@s.whatsapp.net')?.id).toBe('chat1@s.whatsapp.net')

			ev.emit('contacts.upsert', [{ id: 'user1@s.whatsapp.net', name: 'Charlie' }])
			expect(store.getContact('user1@s.whatsapp.net')?.name).toBe('Charlie')

			const msg1: WAMessage = {
				key: { remoteJid: 'chat1@s.whatsapp.net', id: 'SQL1', fromMe: false },
				message: { conversation: 'First' },
				messageTimestamp: 100
			}
			const msg2: WAMessage = {
				key: { remoteJid: 'chat1@s.whatsapp.net', id: 'SQL2', fromMe: false },
				message: { conversation: 'Second' },
				messageTimestamp: 200
			}
			ev.emit('messages.upsert', { messages: [msg1, msg2], type: 'notify' })

			const messages = await store.loadMessages('chat1@s.whatsapp.net', 10)
			expect(messages.length).toBe(2)
			expect(messages[0]?.key.id).toBe('SQL1')
			expect(messages[1]?.key.id).toBe('SQL2')

			const single = await store.loadMessage('chat1@s.whatsapp.net', 'SQL1')
			expect(single?.message?.conversation).toBe('First')

			const recent = await store.mostRecentMessage('chat1@s.whatsapp.net')
			expect(recent?.key.id).toBe('SQL2')

			store.close()
		})

		it('supports useSQLiteAuthState', async () => {
			const { state, saveCreds } = useSQLiteAuthState(':memory:')
			expect(state.creds).toBeDefined()

			state.creds.me = { id: '999@s.whatsapp.net', name: 'Tester' }
			await saveCreds()

			await state.keys.set({
				session: {
					target: new Uint8Array([9, 8, 7])
				}
			})

			const fetched = await state.keys.get('session', ['target'])
			expect(fetched['target']).toBeDefined()
			expect(Buffer.from(fetched['target']!)).toEqual(Buffer.from([9, 8, 7]))
		})
	})
})
