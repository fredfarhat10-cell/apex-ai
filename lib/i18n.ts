// Simple internationalization setup
// For production, use react-i18next or next-intl

export const translations = {
  en: {
    common: {
      welcome: "Welcome to Apex",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
    },
    vault: {
      unlock: "Unlock Vault",
      locked: "Vault Locked",
      unlocked: "Vault Unlocked",
      masterPassword: "Master Password",
      incorrectPassword: "Incorrect password or corrupted vault",
    },
    navigation: {
      dashboard: "Dashboard",
      strategy: "Strategy",
      financial: "Financial",
      stylist: "Stylist",
      knowledge: "Knowledge",
      routines: "Routines",
      simulator: "Simulator",
      vault: "Vault",
    },
    accessibility: {
      skipToContent: "Skip to main content",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      toggleTheme: "Toggle theme",
    },
  },
  es: {
    common: {
      welcome: "Bienvenido a Apex",
      loading: "Cargando...",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar",
    },
    vault: {
      unlock: "Desbloquear Bóveda",
      locked: "Bóveda Bloqueada",
      unlocked: "Bóveda Desbloqueada",
      masterPassword: "Contraseña Maestra",
      incorrectPassword: "Contraseña incorrecta o bóveda corrupta",
    },
    navigation: {
      dashboard: "Panel",
      strategy: "Estrategia",
      financial: "Financiero",
      stylist: "Estilista",
      knowledge: "Conocimiento",
      routines: "Rutinas",
      simulator: "Simulador",
      vault: "Bóveda",
    },
    accessibility: {
      skipToContent: "Saltar al contenido principal",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      toggleTheme: "Cambiar tema",
    },
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

export function useTranslation(lang: Language = "en") {
  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[lang]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return { t, lang }
}
