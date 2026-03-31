import { describe, it, expect } from "@jest/globals"
import { encryptData, decryptData } from "../lib/encryption"

describe("Vault Functionality", () => {
  const mockVaultData = {
    profile: {
      name: "Test User",
      age: 25,
      interests: ["coding", "music"],
    },
    aura: 75,
    expenses: [
      { id: "1", amount: 100, category: "food" },
      { id: "2", amount: 50, category: "transport" },
    ],
    goals: ["Learn React", "Build AI app"],
  }

  it("should encrypt and decrypt vault data correctly", async () => {
    const password = "SecureVaultPass123!"
    const { encrypted } = await encryptData(mockVaultData, password)

    expect(encrypted).toBeTruthy()
    expect(encrypted).not.toContain("Test User")

    const { data, error } = await decryptData(encrypted, password)
    expect(error).toBeUndefined()
    expect(data).toEqual(mockVaultData)
  })

  it("should handle multiple vault operations", async () => {
    const password = "TestPass123!"
    const vaults = []

    // Create 5 vaults
    for (let i = 0; i < 5; i++) {
      const data = { ...mockVaultData, id: `vault-${i}` }
      const { encrypted } = await encryptData(data, password)
      vaults.push({ encrypted, original: data })
    }

    // Verify all vaults decrypt correctly
    for (const vault of vaults) {
      const { data, error } = await decryptData(vault.encrypted, password)
      expect(error).toBeUndefined()
      expect(data).toEqual(vault.original)
    }
  })

  it("should handle password change scenario", async () => {
    const oldPassword = "OldPass123!"
    const newPassword = "NewPass456!"

    // Encrypt with old password
    const { encrypted: oldEncrypted } = await encryptData(mockVaultData, oldPassword)

    // Decrypt with old password
    const { data: decrypted } = await decryptData(oldEncrypted, oldPassword)

    // Re-encrypt with new password
    const { encrypted: newEncrypted } = await encryptData(decrypted, newPassword)

    // Verify old password no longer works
    const { error: oldError } = await decryptData(newEncrypted, oldPassword)
    expect(oldError).toBeTruthy()

    // Verify new password works
    const { data: finalData, error: newError } = await decryptData(newEncrypted, newPassword)
    expect(newError).toBeUndefined()
    expect(finalData).toEqual(mockVaultData)
  })

  it("should handle corrupted data gracefully", async () => {
    const password = "TestPass123!"
    const corruptedData = "corrupted-base64-data"

    const { data, error } = await decryptData(corruptedData, password)
    expect(data).toBeNull()
    expect(error).toBeTruthy()
  })

  it("should maintain data integrity after multiple encrypt/decrypt cycles", async () => {
    const password = "TestPass123!"
    let currentData = mockVaultData

    // Perform 10 encrypt/decrypt cycles
    for (let i = 0; i < 10; i++) {
      const { encrypted } = await encryptData(currentData, password)
      const { data } = await decryptData(encrypted, password)
      currentData = data
    }

    expect(currentData).toEqual(mockVaultData)
  })
})
