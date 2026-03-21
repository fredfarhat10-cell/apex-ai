# Apex AI - Environment Setup Guide

This guide provides step-by-step instructions for obtaining all the necessary API keys and credentials to run the Apex AI application locally.

### **Step 0: Prepare Your `.env.local` File**

1.  Find the `.env.example` file in the root of the project.
2.  Make a copy of it and rename the copy to `.env.local`. This file will hold your secret keys and is ignored by Git.

You will fill in the values in this file as you complete the steps below.

---

### **Step 1: OpenAI API Key (Required)**

This key is essential for the CrewAI agents and all core AI functionality.

1.  **Navigate to the OpenAI Platform:** Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2.  **Log In or Sign Up:** Create an account if you don't have one. You may need to add a payment method, but OpenAI provides a free credit tier for new users.
3.  **Create a New Secret Key:**
    *   Click the "+ Create new secret key" button.
    *   Give it a name (e.g., "Apex AI Dev").
    *   Click "Create secret key".
4.  **Copy the Key:** A key starting with `sk-...` will be displayed. **Copy this key immediately.** You will not be able to see it again.
5.  **Update `.env.local`:**
    \`\`\`
    OPENAI_API_KEY="sk-..."
    \`\`\`

---

### **Step 2: Google Cloud & OAuth Credentials (Required for Key Features)**

This is required for the Google Calendar and Gmail integrations (Action Inbox, Career Guild).

1.  **Go to Google Cloud Console:** Visit [https://console.cloud.google.com/](https://console.cloud.google.com/).
2.  **Create a New Project:**
    *   Click the project dropdown in the top bar and select "New Project".
    *   Give it a name like "Apex AI Project" and click "Create".
3.  **Enable the APIs:**
    *   In the search bar, find and enable the **"Google Calendar API"**.
    *   In the search bar, find and enable the **"Gmail API"**.
4.  **Configure the OAuth Consent Screen:**
    *   Navigate to "APIs & Services" > "OAuth consent screen".
    *   Choose **"External"** and click "Create".
    *   Fill in the required app information (App name: "Apex AI", User support email: your email).
    *   Add your email address under "Developer contact information".
    *   Click "Save and Continue".
    *   On the "Scopes" page, click "Add or Remove Scopes". Find and add the scopes for Calendar and Gmail (`.../auth/calendar.readonly`, `.../auth/gmail.readonly`, etc.). Click "Update".
    *   Click "Save and Continue".
    *   On the "Test users" page, add your own Google email address. This is crucial for testing. Click "Save and Continue".
5.  **Create OAuth 2.0 Credentials:**
    *   Navigate to "APIs & Services" > "Credentials".
    *   Click "+ Create Credentials" and select "OAuth client ID".
    *   For "Application type," select **"Web application"**.
    *   Give it a name (e.g., "Apex AI Web Client").
    *   Under "Authorized redirect URIs", click "+ Add URI" and enter your local development callback URL: **`http://localhost:3000/api/auth/google/callback`**.
    *   Click "Create".
6.  **Copy Credentials:** A modal will appear with your **Client ID** and **Client Secret**.
7.  **Update `.env.local`:**
    \`\`\`
    NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET="your-client-secret"
    GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
    \`\`\`

---

### **Step 3: Plaid API Keys (For Financial Guild)**

This is required for connecting bank accounts in the Financial Command Center.

1.  **Navigate to the Plaid Dashboard:** Go to [https://dashboard.plaid.com/team/keys](https://dashboard.plaid.com/team/keys).
2.  **Log In or Sign Up:** Create a developer account. The Sandbox environment is free and provides test data.
3.  **Copy Your Keys:** On the "Keys" page, you will see your **Client ID** and a **Secret** for the Sandbox environment.
4.  **Update `.env.local`:**
    \`\`\`
    PLAID_CLIENT_ID="your-plaid-client-id"
    PLAID_SECRET="your-plaid-sandbox-secret"
    PLAID_ENV="sandbox"
    \`\`\`
    *Note: For now, we will only use the Sandbox environment.*

---

### **Step 4: Serper API Key (For AI Search Tool)**

This is used by CrewAI agents to perform web searches.

1.  **Navigate to Serper:** Go to [https://serper.dev/](https://serper.dev/).
2.  **Sign Up:** Create a free account. You get 2,500 free queries.
3.  **Get Your API Key:** After signing up, your API key will be available on your dashboard.
4.  **Update `.env.local`:**
    \`\`\`
    SERPER_API_KEY="your-serper-api-key"
    \`\`\`

---

You have now configured all the essential environment variables. You can now proceed with installing dependencies and running the application as described in the `README.md`.
