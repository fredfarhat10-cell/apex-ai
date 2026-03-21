/**
 * Encryption utilities using Web Crypto API
 * - Argon2id for key derivation (memory-hard, GPU-resistant)
 * - AES-GCM for encryption (256-bit keys)
 * - Client-side only - zero server leaks
 */

import * as argon2 from "argon2-browser"

export interface EncryptionResult {
  encrypted: string
  salt: string
  iv: string
}

export interface DecryptionResult<T> {
  data: T | null
  error?: string
}

const ARGON2_TIME = 1 // iterations
const ARGON2_MEMORY = 65536 // 64 MB memory
const ARGON2_PARALLELISM = 4 // parallel threads
const ARGON2_HASH_LENGTH = 32 // 256-bit key
const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_LENGTH = 256

/**
 * Derives a cryptographic key from a password using Argon2id
 * Argon2id is memory-hard and resistant to GPU/ASIC attacks
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const hash = await argon2.hash({
    pass: password,
    salt: salt,
    time: ARGON2_TIME,
    mem: ARGON2_MEMORY,
    hashLen: ARGON2_HASH_LENGTH,
    parallelism: ARGON2_PARALLELISM,
    type: argon2.ArgonType.Argon2id,
  })

  const keyData = hash.hash // This is a Uint8Array
  return await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM", length: KEY_LENGTH }, false, [
    "encrypt",
    "decrypt",
  ])
}

/**
 * Encrypts data using AES-GCM with an Argon2id-derived key
 */
export async function encryptData<T>(data: T, password: string): Promise<EncryptionResult> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    const key = await deriveKey(password, salt)

    const encoder = new TextEncoder()
    const dataString = JSON.stringify(data)
    const dataBuffer = encoder.encode(dataString)

    const encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, dataBuffer)

    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length)

    const encrypted = btoa(String.fromCharCode(...combined))

    return {
      encrypted,
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
    }
  } catch (error) {
    console.error("[v0] Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypts data using AES-GCM with an Argon2id-derived key
 */
export async function decryptData<T>(encrypted: string, password: string): Promise<DecryptionResult<T>> {
  try {
    const combined = new Uint8Array(
      atob(encrypted)
        .split("")
        .map((c) => c.charCodeAt(0)),
    )

    const salt = combined.slice(0, SALT_LENGTH)
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const encryptedData = combined.slice(SALT_LENGTH + IV_LENGTH)

    const key = await deriveKey(password, salt)

    const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData)

    const decoder = new TextDecoder()
    const dataString = decoder.decode(decryptedBuffer)
    const data = JSON.parse(dataString) as T

    return { data }
  } catch (error) {
    console.error("[v0] Decryption error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Decryption failed - incorrect password or corrupted data",
    }
  }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generates a secure random password
 */
export function generateSecurePassword(length = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(randomValues)
    .map((value) => charset[value % charset.length])
    .join("")
}

/**
 * Tests encryption/decryption with sample data
 */
export async function testEncryption(): Promise<{ success: boolean; message: string }> {
  try {
    const testData = {
      id: "test-123",
      name: "Test User",
      timestamp: new Date().toISOString(),
      nested: { value: 42, array: [1, 2, 3] },
    }
    const password = "TestPassword123!"

    const { encrypted } = await encryptData(testData, password)

    const { data, error } = await decryptData<typeof testData>(encrypted, password)

    if (error || !data) {
      return { success: false, message: `Decryption failed: ${error}` }
    }

    const match = JSON.stringify(testData) === JSON.stringify(data)

    return {
      success: match,
      message: match ? "Encryption test passed - 100% data integrity" : "Data mismatch after decryption",
    }
  } catch (error) {
    return {
      success: false,
      message: `Encryption test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
