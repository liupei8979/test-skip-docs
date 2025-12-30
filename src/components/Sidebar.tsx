import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Rocket, Building2, Code, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface DocItem {
    path: string
    title: string
    file: string
    category?: string
}

interface SidebarProps {
    docsList: DocItem[]
    isDark: boolean
}

const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    index: { label: '문서 인덱스', icon: Home },
    overview: { label: '프로젝트 개요', icon: BookOpen },
    'getting-started': { label: '착수 가이드', icon: Rocket },
    architecture: { label: '아키텍처', icon: Building2 },
    development: { label: '개발 가이드', icon: Code },
}

// 카테고리별로 그룹화
const categorizeDocs = (docs: DocItem[]) => {
    const categorized: Record<string, DocItem[]> = {}

    docs.forEach(doc => {
        const category = doc.category || 'general'
        if (!categorized[category]) {
            categorized[category] = []
        }
        categorized[category].push(doc)
    })

    return categorized
}

export default function Sidebar({ docsList, isDark }: SidebarProps) {
    const location = useLocation()
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(['index', 'overview', 'getting-started', 'architecture', 'development'])
    )
    const categorized = categorizeDocs(docsList)

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(category)) {
            newExpanded.delete(category)
        } else {
            newExpanded.add(category)
        }
        setExpandedCategories(newExpanded)
    }

    // 카테고리 순서 정의 (읽기 순서대로)
    const categoryOrder = ['index', 'overview', 'getting-started', 'architecture', 'development']

    return (
        <aside
            className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 backdrop-blur-xl border-r z-20 overflow-y-auto transition-colors duration-200 ${
                isDark ? 'bg-black/30 border-white/10' : 'bg-gray-50/80 border-gray-200'
            }`}
        >
            <div className="p-4">
                <nav className="space-y-1">
                    {categoryOrder.map(categoryKey => {
                        const docs = categorized[categoryKey]
                        if (!docs || docs.length === 0) return null

                        const config = categoryConfig[categoryKey] || { label: categoryKey, icon: BookOpen }
                        const CategoryIcon = config.icon
                        const isExpanded = expandedCategories.has(categoryKey)

                        return (
                            <div key={categoryKey} className="mb-4">
                                <button
                                    onClick={() => toggleCategory(categoryKey)}
                                    className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors group ${
                                        isDark
                                            ? 'text-gray-400 hover:text-gray-300'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CategoryIcon className="w-4 h-4" />
                                        <span>{config.label}</span>
                                    </div>
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform ${
                                            isDark ? 'text-gray-500' : 'text-gray-400'
                                        } ${isExpanded ? 'rotate-90' : ''}`}
                                    />
                                </button>
                                {isExpanded && (
                                    <div className="mt-1 ml-1 space-y-0.5">
                                        {docs.map(doc => {
                                            const isActive = location.pathname === doc.path
                                            return (
                                                <Link
                                                    key={doc.path}
                                                    to={doc.path}
                                                    className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                                                        isActive
                                                            ? isDark
                                                                ? 'bg-white/10 text-white font-medium border-l-2 border-primary-400'
                                                                : 'bg-primary-50 text-primary-700 font-medium border-l-2 border-primary-600'
                                                            : isDark
                                                              ? 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                                                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <span className="truncate">{doc.title}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>
            </div>
        </aside>
    )
}
