import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
    isDark: boolean
    setIsDark: (isDark: boolean) => void
}

export default function ThemeToggle({ isDark, setIsDark }: ThemeToggleProps) {
    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-200 ${
                isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
            }`}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            ) : (
                <Moon className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            )}
        </button>
    )
}
