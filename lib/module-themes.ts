export const moduleThemes = {
  "mono-dark": {
    background: "from-gray-900 via-gray-800 to-black",
    border: "border-gray-600/30",
    text: {
      primary: "text-gray-100",
      secondary: "text-gray-400",
      accent: "text-gray-300",
    },
    button: {
      primary: "bg-gray-700 hover:bg-gray-600 text-gray-100",
      secondary: "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300",
    },
    card: "bg-gray-900/60 border-gray-700/40",
    accent: "gray-500",
  },
  "neon-purple": {
    background: "from-purple-900 via-pink-900 to-black",
    border: "border-purple-400/30",
    text: {
      primary: "text-purple-100",
      secondary: "text-purple-300",
      accent: "text-pink-400",
    },
    button: {
      primary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 text-white",
      secondary: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/50",
    },
    card: "bg-purple-900/40 border-purple-400/30",
    accent: "purple-500",
  },
  "pink-glass": {
    background: "from-pink-900 via-rose-900 to-black",
    border: "border-pink-400/30",
    text: {
      primary: "text-pink-100",
      secondary: "text-pink-300",
      accent: "text-rose-400",
    },
    button: {
      primary: "bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 text-white",
      secondary: "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/50",
    },
    card: "bg-pink-900/40 border-pink-400/30 backdrop-blur-md",
    accent: "pink-500",
  },
  "cool-blue": {
    background: "from-blue-900 via-cyan-900 to-black",
    border: "border-cyan-400/30",
    text: {
      primary: "text-cyan-100",
      secondary: "text-cyan-300",
      accent: "text-blue-400",
    },
    button: {
      primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 text-white",
      secondary: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50",
    },
    card: "bg-cyan-900/40 border-cyan-400/30",
    accent: "cyan-500",
  },
}

export type ModuleTheme = keyof typeof moduleThemes
