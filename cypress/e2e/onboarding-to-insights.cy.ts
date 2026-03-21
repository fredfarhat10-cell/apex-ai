import { describe, beforeEach, it } from "cypress"
import { cy } from "cypress"

describe("Onboarding to Insights Flow", () => {
  beforeEach(() => {
    // Clear localStorage to start fresh
    cy.clearLocalStorage()
    cy.visit("/")
  })

  it("should complete full onboarding and generate insights", () => {
    // Step 1: Onboarding - Create vault
    cy.contains("Welcome to Apex AI").should("be.visible")
    cy.get('input[type="password"]').first().type("SecurePass123!")
    cy.get('input[type="password"]').last().type("SecurePass123!")
    cy.contains("button", "Create Vault").click()

    // Step 2: Profile setup
    cy.get('input[placeholder*="name"]').type("Test User")
    cy.get('input[placeholder*="age"]').type("25")

    // Step 3: Add hobbies (voice or text)
    cy.contains("Share your hobbies").should("be.visible")
    cy.get('input[placeholder*="hobby"]').type("guitar, art, coding")
    cy.contains("button", "Continue").click()

    // Step 4: Wait for dashboard to load
    cy.contains("Nexus Core", { timeout: 10000 }).should("be.visible")

    // Step 5: Navigate to Strategy (Prime Path)
    cy.get('[data-testid="nav-strategy"]').click()
    cy.contains("Prime Path").should("be.visible")

    // Step 6: Generate insights
    cy.contains("button", "Generate Path").click()
    cy.contains("Loading", { timeout: 15000 }).should("not.exist")

    // Verify insights are displayed
    cy.get('[data-testid="prime-path-step"]').should("have.length.at.least", 1)
  })

  it("should handle login after vault creation", () => {
    // Create vault first
    cy.contains("Welcome to Apex AI").should("be.visible")
    cy.get('input[type="password"]').first().type("TestPass123!")
    cy.get('input[type="password"]').last().type("TestPass123!")
    cy.contains("button", "Create Vault").click()

    // Complete minimal onboarding
    cy.get('input[placeholder*="name"]').type("Test User")
    cy.contains("button", "Continue").click()

    // Reload page to trigger login
    cy.reload()

    // Should show login screen
    cy.contains("Unlock Your Vault").should("be.visible")
    cy.get('input[type="password"]').type("TestPass123!")
    cy.contains("button", "Unlock").click()

    // Should reach dashboard
    cy.contains("Nexus Core", { timeout: 10000 }).should("be.visible")
  })

  it("should handle incorrect password gracefully", () => {
    // Create vault
    cy.contains("Welcome to Apex AI").should("be.visible")
    cy.get('input[type="password"]').first().type("CorrectPass123!")
    cy.get('input[type="password"]').last().type("CorrectPass123!")
    cy.contains("button", "Create Vault").click()

    // Complete onboarding
    cy.get('input[placeholder*="name"]').type("Test User")
    cy.contains("button", "Continue").click()

    // Reload to trigger login
    cy.reload()

    // Try wrong password
    cy.get('input[type="password"]').type("WrongPass123!")
    cy.contains("button", "Unlock").click()

    // Should show error
    cy.contains("Incorrect password").should("be.visible")
  })
})
