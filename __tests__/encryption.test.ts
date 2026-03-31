/**
 * Encryption test suite
 * Run with: npm test
 */

import { describe, it, expect } from "@jest/globals"
import { encryptData, decryptData, validatePassword, generateSecurePassword, testEncryption } from "../lib/encryption"

describe("Encryption", () => {
  it("should encrypt and decrypt data correctly", async () => {
    const testData = { id: "123", name: "Test", value: 42 }
    const password = "SecurePassword123!"

    const { encrypted } = await encryptData(testData, password)
    expect(encrypted).toBeTruthy()

    const { data, error } = await decryptData<typeof testData>(encrypted, password)
    expect(error).toBeUndefined()
    expect(data).toEqual(testData)
  })

  it("should fail decryption with wrong password", async () => {
    const testData = { secret: "data" }
    const { encrypted } = await encryptData(testData, "correct-password")

    const { data, error } = await decryptData(encrypted, "wrong-password")
    expect(data).toBeNull()
    expect(error).toBeTruthy()
  })

  it("should maintain data integrity for complex objects", async () => {
    const complexData = {
      user: { name: "John", age: 30 },
      items: [1, 2, 3, 4, 5],
      nested: { deep: { value: "test" } },
      timestamp: new Date().toISOString(),
    }
    const password = "TestPass123!"

    const { encrypted } = await encryptData(complexData, password)
    const { data } = await decryptData<typeof complexData>(encrypted, password)

    expect(JSON.stringify(data)).toBe(JSON.stringify(complexData))
  })

  it("should validate password strength", () => {
    expect(validatePassword("weak").valid).toBe(false)
    expect(validatePassword("StrongPass123!").valid).toBe(true)
    expect(validatePassword("nouppercas3!").valid).toBe(false)
    expect(validatePassword("NOLOWERCASE3!").valid).toBe(false)
    expect(validatePassword("NoNumbers!").valid).toBe(false)
  })

  it("should generate secure passwords", () => {
    const password = generateSecurePassword(16)
    expect(password.length).toBe(16)
    expect(validatePassword(password).valid).toBe(true)
  })

  it("should pass encryption self-test", async () => {
    const result = await testEncryption()
    expect(result.success).toBe(true)
  })
})
