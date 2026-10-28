// nonceService.ts
class NonceService {
  private static readonly NONCE_LENGTH = 16

  // Simulate getting the userId (you can replace this with your auth hook/service)
  private getUserId(): string | null {
    const user = localStorage.getItem('authToken')

    if (user) {
      const userObject = JSON.parse(user)
      return userObject['id']
    }
    return null
  }

  // Generate a secure nonce
  private generateNonce(): string {
    const array = new Uint8Array(NonceService.NONCE_LENGTH)
    window.crypto.getRandomValues(array)
    return this.arrayToHex(array)
  }

  // Convert byte array to hexadecimal string
  private arrayToHex(array: Uint8Array): string {
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  // Generate a secure signature
  async generateSignature(): Promise<{
    signature: string
    nonce: string
    timestamp: string
    userId: string | null
  }> {
    const nonce = this.generateNonce()
    const timestamp = Date.now().toString()

    const userId = this.getUserId()
    let data

    if (userId) {
      data = `${nonce}|${timestamp}|${userId}`
    } else {
      data = `${nonce}|${timestamp}`
    }

    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return {
      signature: hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join(''),
      nonce,
      timestamp,
      userId,
    }
  }
}

// Export a single instance
const nonceService = new NonceService()
export default nonceService
