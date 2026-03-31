# Apex AI - Robust Persistence System

## Overview

Apex AI now uses a **robust, reliable persistence layer** built on IndexedDB that ensures your data survives refreshes, tab closures, and OS restarts. Your memory is encrypted locally and never leaves your device.

## Key Features

### 🔒 **Encrypted Storage**
- All data is encrypted using **AES-256-GCM** encryption
- Encryption key derived from your master password using **PBKDF2** (100,000 iterations)
- Data is encrypted before storage and decrypted only when you unlock your vault

### 💾 **IndexedDB Persistence**
- Uses IndexedDB as the canonical local store (via `idb` wrapper)
- More reliable than localStorage for large datasets
- Survives browser refreshes, tab closures, and system restarts
- Automatic migration from localStorage to IndexedDB on first load

### ⚡ **Auto-Save with Debouncing**
- Changes are automatically saved every **600ms** (configurable)
- Debounced to prevent excessive writes
- Visual status indicator shows save state: "Saving..." → "Saved ✓"

### 🔄 **Retry Logic**
- Automatic retry on save failures (up to 3 attempts)
- Exponential backoff between retries
- Clear error messages when save fails

### 📤 **Export & Import**
- **Export**: Download encrypted backup as JSON file
- **Import**: Restore from backup file
- Backups are fully encrypted and portable
- File naming: `apex-vault-backup-YYYY-MM-DD.json`

### 📊 **Save Status Indicator**
- Real-time save status in top-right corner
- Shows: "Saving...", "Saved ✓", or error messages
- Displays last save timestamp
- Quick access to export functionality

## Architecture

### File Structure

\`\`\`
lib/
├── indexeddb-persistence.ts  # IndexedDB wrapper with encryption
├── encryption.ts              # AES-GCM encryption utilities
├── vault-context.tsx          # React context with auto-save
└── vault-storage.ts           # Legacy localStorage (deprecated)

components/
└── save-status-indicator.tsx  # Visual save status UI
\`\`\`

### Data Flow

\`\`\`
User Action
    ↓
State Update (React Context)
    ↓
Debounce (600ms)
    ↓
Encrypt Data (AES-256-GCM)
    ↓
Save to IndexedDB (with retry)
    ↓
Update Save Status UI
\`\`\`

## Usage

### Accessing Save Status

\`\`\`typescript
import { useVault } from "@/lib/vault-context"

function MyComponent() {
  const { saveStatus, saveError, lastSaved } = useVault()
  
  // saveStatus: "idle" | "saving" | "saved" | "error"
  // saveError: string | undefined
  // lastSaved: Date | undefined
}
\`\`\`

### Manual Export

\`\`\`typescript
import { exportVault } from "@/lib/indexeddb-persistence"

const result = await exportVault()
if (result.success && result.blob) {
  // Download the blob
  const url = URL.createObjectURL(result.blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "apex-vault-backup.json"
  a.click()
}
\`\`\`

### Manual Import

\`\`\`typescript
import { importVault } from "@/lib/indexeddb-persistence"

const file = // ... get file from input
const result = await importVault(file)
if (result.success) {
  // Vault imported successfully
  window.location.reload()
}
\`\`\`

## Security Guarantees

### ✅ What's Protected
- All user data is encrypted before storage
- Encryption key never stored, derived from password each time
- Data never sent to cloud or external servers
- Encrypted backups can only be decrypted with master password

### ✅ What's Stored
- **IndexedDB**: Encrypted vault data + metadata
- **Memory**: Decrypted data (cleared on logout)
- **No localStorage**: Migrated to IndexedDB automatically

### ✅ Threat Model
- **Protected Against**: 
  - Local file system access (data is encrypted)
  - Browser history/cache inspection
  - Network interception (no network calls)
  - Malicious extensions (data encrypted at rest)

- **Not Protected Against**:
  - Keyloggers capturing master password
  - Memory dumps while vault is unlocked
  - Physical access to unlocked device

## Migration from localStorage

The system automatically migrates data from localStorage to IndexedDB on first load:

1. Checks if IndexedDB vault exists
2. If not, checks for localStorage vault
3. Migrates encrypted data to IndexedDB
4. Removes localStorage vault
5. All future operations use IndexedDB

## Performance

- **Save Time**: ~10-50ms (depending on data size)
- **Load Time**: ~20-100ms (depending on data size)
- **Storage Limit**: ~50MB+ (browser dependent)
- **Debounce Delay**: 600ms (configurable)

## Error Handling

### Save Errors
- Automatic retry with exponential backoff
- Visual error indicator in UI
- Error message displayed to user
- Console logs for debugging

### Load Errors
- Clear error messages for wrong password
- Corruption detection
- Fallback to empty state if unrecoverable

## Best Practices

### For Users
1. **Regular Backups**: Export your vault weekly
2. **Strong Password**: Use a unique, strong master password
3. **Secure Storage**: Store backup files securely
4. **Test Restore**: Verify backups work before relying on them

### For Developers
1. **Never Log Decrypted Data**: Use `[v0]` prefix for debug logs
2. **Test Migration**: Verify localStorage → IndexedDB migration
3. **Handle Errors**: Always check result.success before proceeding
4. **Debounce Saves**: Don't save on every keystroke

## Troubleshooting

### "Save Failed" Error
1. Check browser console for detailed error
2. Verify IndexedDB is enabled in browser
3. Check available storage space
4. Try exporting backup and reimporting

### "Failed to Load Vault"
1. Verify correct password
2. Check if vault exists (should show login screen)
3. Try importing from backup
4. Check browser console for errors

### Migration Issues
1. Check if localStorage vault exists
2. Verify password is correct
3. Check browser console for migration logs
4. Manual migration: Export from old system, import to new

## Future Enhancements

- [ ] Background sync for offline changes
- [ ] Conflict resolution for multi-device sync
- [ ] Compression for large datasets
- [ ] Incremental backups
- [ ] Cloud backup option (encrypted)
- [ ] Biometric unlock support
- [ ] Auto-lock on inactivity

## API Reference

### `saveVault<T>(data: T, password: string, retries?: number)`
Encrypts and saves data to IndexedDB with retry logic.

**Returns**: `Promise<{ success: boolean; error?: string }>`

### `loadVault<T>(password: string)`
Loads and decrypts data from IndexedDB.

**Returns**: `Promise<{ data: T | null; error?: string }>`

### `vaultExists()`
Checks if a vault exists in IndexedDB.

**Returns**: `Promise<boolean>`

### `exportVault()`
Exports encrypted vault as downloadable blob.

**Returns**: `Promise<{ success: boolean; blob?: Blob; error?: string }>`

### `importVault(file: File)`
Imports vault from encrypted backup file.

**Returns**: `Promise<{ success: boolean; error?: string }>`

### `deleteVault()`
Permanently deletes vault from IndexedDB.

**Returns**: `Promise<{ success: boolean; error?: string }>`

---

**Built with trust and security in mind. Your data, your control.**
