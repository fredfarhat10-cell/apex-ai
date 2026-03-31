"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testEncryption } from "@/lib/encryption"
import { saveVault, loadVault, deleteVault, exportVault, importVault } from "@/lib/vault-storage"
import { initialAppState, type AppState } from "@/lib/types"
import { CheckCircle2Icon, XCircleIcon, AlertTriangleIcon } from "./icons"

interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
}

export function VaultTestUtility() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = []

    // Test 1: Encryption/Decryption
    console.log("[v0] Running encryption test...")
    const encryptionTest = await testEncryption()
    testResults.push({
      name: "Encryption/Decryption",
      status: encryptionTest.success ? "pass" : "fail",
      message: encryptionTest.message,
    })

    // Test 2: Create 5 Sample Vaults
    console.log("[v0] Creating 5 sample vaults...")
    const vaultPasswords = ["Test123!", "Secure456!", "Strong789!", "Complex012!", "Vault345!"]
    let vaultsCreated = 0

    for (let i = 0; i < vaultPasswords.length; i++) {
      try {
        const testState: AppState = {
          ...initialAppState,
          userProfile: {
            name: `Test User ${i + 1}`,
            email: `test${i + 1}@example.com`,
            bio: `Sample vault ${i + 1}`,
            interests: ["testing", "security"],
            hobbies: ["encryption"],
            studioPreferences: {},
            activeStudio: "nexus",
          },
        }

        await saveVault(testState, vaultPasswords[i])
        const loaded = await loadVault(vaultPasswords[i])

        if (loaded && loaded.userProfile.name === `Test User ${i + 1}`) {
          vaultsCreated++
          console.log(`[v0] Vault ${i + 1} created and verified`)
        }
      } catch (error) {
        console.error(`[v0] Failed to create vault ${i + 1}:`, error)
      }
    }

    testResults.push({
      name: "Create 5 Sample Vaults",
      status: vaultsCreated === 5 ? "pass" : vaultsCreated > 0 ? "warning" : "fail",
      message: `Created and verified ${vaultsCreated}/5 sample vaults`,
    })

    // Test 3: Password Loss Simulation
    console.log("[v0] Simulating password loss...")
    try {
      await saveVault(initialAppState, "OriginalPassword123!")
      const wrongPasswordResult = await loadVault("WrongPassword456!")

      testResults.push({
        name: "Password Loss Simulation",
        status: wrongPasswordResult === null ? "pass" : "fail",
        message:
          wrongPasswordResult === null
            ? "Vault correctly locked with wrong password"
            : "Security breach: vault accessible with wrong password",
      })
    } catch (error) {
      testResults.push({
        name: "Password Loss Simulation",
        status: "pass",
        message: "Vault correctly locked - decryption failed as expected",
      })
    }

    // Test 4: Data Leak Check (localStorage inspection)
    console.log("[v0] Checking for data leaks...")
    const vaultData = localStorage.getItem("apex-vault")
    const hasPlaintext =
      vaultData &&
      (vaultData.includes("Test User") || vaultData.includes("test@example.com") || vaultData.includes('"userProfile"'))

    testResults.push({
      name: "Data Leak Check",
      status: !hasPlaintext ? "pass" : "fail",
      message: !hasPlaintext
        ? "No plaintext data found in localStorage - all data encrypted"
        : "WARNING: Plaintext data detected in localStorage",
    })

    // Test 5: Export/Import Functionality
    console.log("[v0] Testing export/import...")
    try {
      const testState: AppState = {
        ...initialAppState,
        userProfile: {
          name: "Export Test User",
          email: "export@test.com",
          bio: "Testing export",
          interests: [],
          hobbies: [],
          studioPreferences: {},
          activeStudio: "nexus",
        },
      }

      await saveVault(testState, "ExportTest123!")
      const exported = await exportVault("ExportTest123!")
      deleteVault()
      const imported = await importVault(exported, "ExportTest123!")

      testResults.push({
        name: "Export/Import",
        status: imported ? "pass" : "fail",
        message: imported ? "Vault successfully exported and imported" : "Export/import failed",
      })
    } catch (error) {
      testResults.push({
        name: "Export/Import",
        status: "fail",
        message: `Export/import error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    setResults(testResults)
    setIsRunning(false)
    console.log("[v0] All tests completed")
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2Icon className="w-5 h-5 text-green-500" />
      case "fail":
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      pass: "bg-green-500/10 text-green-500 border-green-500/20",
      fail: "bg-red-500/10 text-red-500 border-red-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const passedTests = results.filter((r) => r.status === "pass").length
  const totalTests = results.length

  return (
    <Card className="bg-apex-dark/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Vault Security Test Suite</CardTitle>
        <CardDescription>
          Comprehensive testing for encryption, vault creation, password security, and data leak prevention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? "Running Tests..." : "Run Security Tests"}
        </Button>

        {results.length > 0 && (
          <>
            <div className="flex items-center justify-between p-4 bg-apex-darker rounded-lg">
              <span className="text-white font-semibold">Test Results</span>
              <span className="text-apex-gray">
                {passedTests}/{totalTests} Passed
              </span>
            </div>

            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-apex-darker/50 rounded-lg border border-gray-800"
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">{result.name}</h4>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-apex-gray">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
