import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'

interface SearchProps {
    onClose: () => void
    docsList: Array<{ path: string; title: string; file: string }>
}

export default function Search({ onClose, docsList }: SearchProps) {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<
        Array<{ path: string; title: string; file: string; matchType: 'title' | 'content' }>
    >([])
    const [searchContent, setSearchContent] = useState<Record<string, string>>({})
    const inputRef = useRef<HTMLInputElement>(null)

    // 마크다운 파일 내용 로드
    useEffect(() => {
        const loadContent = async () => {
            const contentMap: Record<string, string> = {}
            for (const doc of docsList) {
                try {
                    const response = await fetch(`/docs/${doc.file}`)
                    const text = await response.text()
                    contentMap[doc.file] = text
                } catch (err) {
                    console.error(`Failed to load ${doc.file}:`, err)
                }
            }
            setSearchContent(contentMap)
        }
        loadContent()
    }, [docsList])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    useEffect(() => {
        if (query.trim() === '') {
            setResults([])
            return
        }

        const lowerQuery = query.toLowerCase()
        const filtered: Array<{ path: string; title: string; file: string; matchType: 'title' | 'content' }> = []

        docsList.forEach(doc => {
            const titleMatch = doc.title.toLowerCase().includes(lowerQuery)
            const content = searchContent[doc.file] || ''
            const contentMatch = content.toLowerCase().includes(lowerQuery)

            if (titleMatch || contentMatch) {
                filtered.push({
                    ...doc,
                    matchType: titleMatch ? 'title' : 'content',
                })
            }
        })

        // 제목 매칭을 우선순위로 정렬
        filtered.sort((a, b) => {
            if (a.matchType === 'title' && b.matchType !== 'title') return -1
            if (a.matchType !== 'title' && b.matchType === 'title') return 1
            return 0
        })

        setResults(filtered.slice(0, 8))
    }, [query, docsList, searchContent])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'Enter' && results.length > 0) {
            navigate(results[0].path)
            onClose()
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            // 키보드 네비게이션은 나중에 구현 가능
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/70 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl mx-4 bg-black/60 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="검색... (ESC로 닫기, Enter로 첫 결과 이동)"
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                    />
                    <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                {results.length > 0 && (
                    <div className="max-h-64 overflow-y-auto">
                        {results.map(result => (
                            <button
                                key={result.path}
                                onClick={() => {
                                    navigate(result.path)
                                    onClose()
                                }}
                                className="w-full text-left block px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
                            >
                                <div className="font-medium text-white">{result.title}</div>
                                <div className="text-sm text-gray-400 mt-1">{result.path}</div>
                                {result.matchType === 'content' && (
                                    <div className="text-xs text-gray-500 mt-1">내용에서 발견됨</div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
                {query && results.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-400">검색 결과가 없습니다.</div>
                )}
            </div>
        </div>
    )
}
