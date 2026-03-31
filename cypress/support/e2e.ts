// Cypress E2E support file
// Add custom commands and global configuration

// Import Cypress
import { cy } from "cypress"

// Prevent TypeScript errors
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with password
       * @example cy.login('SecurePass123!')
       */
      login(password: string): Chainable<void>
    }
  }
}

// Custom command for login
Cypress.Commands.add("login", (password: string) => {
  cy.get('input[type="password"]').type(password)
  cy.contains("button", "Unlock").click()
  cy.contains("Nexus Core", { timeout: 10000 }).should("be.visible")
})

// Suppress ResizeObserver errors (common in React apps)
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/
Cypress.on("uncaught:exception", (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false
  }
})
