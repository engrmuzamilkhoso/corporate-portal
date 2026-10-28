import { pem_key } from './constants'

// utils/encryptionDecryptionService.ts
export class EncryptionDecryptionService {
  decryptedAESKey: Uint8Array | null = null
  decryptedIV: Uint8Array | null = null

  fixBase64(b64: string): string {
    b64 = b64.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4 !== 0) {
      b64 += '='
    }
    return b64
  }

  ab2b64(arrayBuffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
  }

  b642ab(base64string: string): Uint8Array {
    return Uint8Array.from(atob(this.fixBase64(base64string)), (c) => c.charCodeAt(0))
  }

  async importPrivateKey(pem: string): Promise<CryptoKey> {
    const b64 = pem
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '')

    const binaryDer = atob(b64)
    const binaryArray = new Uint8Array([...binaryDer].map((c) => c.charCodeAt(0)))

    return await crypto.subtle.importKey(
      'pkcs8',
      binaryArray.buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['decrypt'],
    )
  }

  async rsaDecryptWithWebCrypto(
    encryptedBase64: string,
    privateKey: CryptoKey,
  ): Promise<Uint8Array | null> {
    try {
      const encryptedBuffer = this.b642ab(encryptedBase64)
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedBuffer,
      )
      return new Uint8Array(decryptedBuffer)
    } catch (error) {
      console.error('❌ RSA Decryption error:', error)
      return null
    }
  }

  async decryptAESWithWebCrypto(
    encryptedBase64: string,
    aesKeyRaw: Uint8Array,
    ivRaw: Uint8Array,
  ): Promise<string> {
    try {
      const encryptedBytes = this.b642ab(encryptedBase64)

      const key = await crypto.subtle.importKey('raw', aesKeyRaw, { name: 'AES-CBC' }, false, [
        'decrypt',
      ])

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-CBC',
          iv: ivRaw,
        },
        key,
        encryptedBytes,
      )

      return new TextDecoder().decode(decryptedBuffer)
    } catch (error) {
      console.error('❌ AES Decryption failed:', error)
      return ''
    }
  }

  async decryptResponseBody(body: { data: string; key: string }) {
    const privateKey = await this.importPrivateKey(pem_key)
    const rsaBase64EncryptedKey = body.key
    const base64EncryptedData = body.data

    const decryptedKeyIvBytes = await this.rsaDecryptWithWebCrypto(
      rsaBase64EncryptedKey,
      privateKey,
    )

    // Split AES key and IV
    const aesKeyRaw = decryptedKeyIvBytes!.slice(0, 32)
    const ivRaw = decryptedKeyIvBytes!.slice(32, 48)

    if (aesKeyRaw.length !== 32 || ivRaw.length !== 16) {
      throw new Error('Invalid AES key or IV length after RSA decryption')
    }

    // AES-decrypt the payload with raw key and IV
    const decryptedData = await this.decryptAESWithWebCrypto(base64EncryptedData, aesKeyRaw, ivRaw)
    
    return JSON.parse(decryptedData)
  }
}
