declare module 'libsignal/src/crypto' {
	type BufferLike = ArrayBuffer | Buffer | Uint8Array
	export function encrypt(key: BufferLike, data: BufferLike, iv: BufferLike): Buffer
	export function decrypt(key: BufferLike, data: BufferLike, iv: BufferLike): Buffer
	export function calculateMAC(key: BufferLike, data: BufferLike): Buffer
	export function deriveSecrets(input: BufferLike, salt: BufferLike, info: BufferLike, chunks?: number): Buffer[]
}

declare module 'libsignal/src/curve' {
	export interface KeyPairType {
		pubKey: Buffer
		privKey: Buffer
	}
	type BufferLike = ArrayBuffer | Buffer | Uint8Array
	export function generateKeyPair(): KeyPairType
	export function calculateAgreement(pubKey: BufferLike, privKey: BufferLike): Buffer
	export function calculateSignature(privKey: BufferLike, message: BufferLike): Buffer
	export function verifySignature(pubKey: BufferLike, message: BufferLike, signature: BufferLike): boolean
}
