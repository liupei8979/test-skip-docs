import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import Search from './Search'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
    isDark: boolean
    setIsDark: (isDark: boolean) => void
    docsList: Array<{ path: string; title: string; file: string }>
}

export default function Header({ isDark, setIsDark, docsList }: HeaderProps) {
    const [showSearch, setShowSearch] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowSearch(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-30 backdrop-blur-xl border-b transition-colors duration-200 ${
                    isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-gray-200'
                }`}
            >
                <div className="flex items-center justify-between h-16 w-full">
                    <div className="px-6 flex-shrink-0">
                        <Link
                            to="/"
                            className={`flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}
                        >
                            <span>Docs</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 px-6 flex-shrink-0">
                        <button
                            onClick={() => setShowSearch(true)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg backdrop-blur-sm border transition-all ${
                                isDark
                                    ? 'text-gray-300 bg-white/5 hover:bg-white/10 border-white/10'
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-200'
                            }`}
                        >
                            <SearchIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">검색</span>
                            <kbd
                                className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold border rounded ${
                                    isDark
                                        ? 'text-gray-400 bg-black/40 border-white/10'
                                        : 'text-gray-500 bg-white border-gray-300'
                                }`}
                            >
                                ⌘K
                            </kbd>
                        </button>
                        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
                    </div>
                </div>
            </header>
            {showSearch && <Search onClose={() => setShowSearch(false)} docsList={docsList} />}
        </>
    )
}
