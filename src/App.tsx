import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Sidebar from './components/Sidebar'
import MarkdownViewer from './components/MarkdownViewer'
import Header from './components/Header'

gsap.registerPlugin(ScrollToPlugin)

const docsList = [
    // 문서 인덱스
    { path: '/', title: '홈', file: 'README.md', category: 'index' },

    // 프로젝트 개요
    { path: '/project-overview', title: '프로젝트 개요', file: 'PROJECT_OVERVIEW.md', category: 'overview' },

    // 착수 가이드
    { path: '/getting-started', title: '착수 가이드', file: 'GETTING_STARTED.md', category: 'getting-started' },
    { path: '/onboarding', title: '온보딩 가이드', file: 'ONBOARDING_GUIDE.md', category: 'getting-started' },

    // 아키텍처
    { path: '/architecture', title: '아키텍처', file: 'ARCHITECTURE.md', category: 'architecture' },

    // 개발 가이드
    { path: '/development', title: '개발 가이드', file: 'DEVELOPMENT_GUIDE.md', category: 'development' },
]

function App() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme')
        if (saved) {
            return saved === 'dark'
        }
        // 기본값은 다크 모드 (블랙)
        return true
    })

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
            document.documentElement.style.colorScheme = 'dark'
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            document.documentElement.style.colorScheme = 'light'
            localStorage.setItem('theme', 'light')
        }
    }, [isDark])

    // 스크롤 바운스 효과 완전히 막기
    useEffect(() => {
        // CSS로 바운스 방지
        document.documentElement.style.overscrollBehavior = 'none'
        document.body.style.overscrollBehavior = 'none'

        let rafId: number | null = null
        let lastScrollTop = 0

        const checkAndLockScroll = () => {
            if (rafId) {
                cancelAnimationFrame(rafId)
            }

            rafId = requestAnimationFrame(() => {
                const windowHeight = window.innerHeight
                const documentHeight = document.documentElement.scrollHeight
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                const maxScroll = Math.max(0, documentHeight - windowHeight)

                // 맨 위에서 벗어나려고 할 때 즉시 고정
                if (scrollTop < 0) {
                    window.scrollTo({ top: 0, behavior: 'auto' })
                    return
                }

                // 맨 아래에서 벗어나려고 할 때 즉시 고정
                if (scrollTop > maxScroll) {
                    window.scrollTo({ top: maxScroll, behavior: 'auto' })
                    return
                }

                lastScrollTop = scrollTop
            })
        }

        // 휠 이벤트로 스크롤 제한
        const handleWheel = (e: WheelEvent) => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
            const maxScroll = Math.max(0, documentHeight - windowHeight)

            // 맨 위에서 위로 스크롤 시도
            if (scrollTop <= 0 && e.deltaY < 0) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                return false
            }

            // 맨 아래에서 아래로 스크롤 시도
            if (scrollTop >= maxScroll - 1 && e.deltaY > 0) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                return false
            }
        }

        // 터치 이벤트로 스크롤 제한 (모바일)
        let touchStartY = 0
        let touchStartScrollTop = 0

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY
            touchStartScrollTop = window.pageYOffset || document.documentElement.scrollTop
        }

        const handleTouchMove = (e: TouchEvent) => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
            const maxScroll = Math.max(0, documentHeight - windowHeight)
            const touchY = e.touches[0].clientY
            const deltaY = touchStartY - touchY
            const newScrollTop = touchStartScrollTop + deltaY

            // 맨 위에서 위로 스와이프 시도
            if (scrollTop <= 0 && deltaY < 0) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                return false
            }

            // 맨 아래에서 아래로 스와이프 시도
            if (scrollTop >= maxScroll - 1 && deltaY > 0) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                return false
            }

            // 스크롤 범위를 벗어나려고 할 때
            if (newScrollTop < 0) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                return false
            }

            if (newScrollTop > maxScroll) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                return false
            }
        }

        // 스크롤 이벤트로 위치 즉시 고정
        const handleScroll = () => {
            checkAndLockScroll()
        }

        window.addEventListener('scroll', handleScroll, { passive: false, capture: true })
        window.addEventListener('wheel', handleWheel, { passive: false, capture: true })
        window.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true })
        window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })

        // 초기 스크롤 위치 확인
        checkAndLockScroll()

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId)
            }
            window.removeEventListener('scroll', handleScroll, { capture: true })
            window.removeEventListener('wheel', handleWheel, { capture: true })
            window.removeEventListener('touchstart', handleTouchStart, { capture: true })
            window.removeEventListener('touchmove', handleTouchMove, { capture: true })
        }
    }, [])

    return (
        <Router>
            <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-black' : 'bg-white'}`}>
                <Header isDark={isDark} setIsDark={setIsDark} docsList={docsList} />
                <div className="flex pt-16">
                    <Sidebar docsList={docsList} isDark={isDark} />
                    <main className="flex-1 lg:ml-64">
                        <div className="max-w-4xl mx-auto px-6 py-12">
                            <Routes>
                                {docsList.map(doc => (
                                    <Route
                                        key={doc.path}
                                        path={doc.path}
                                        element={<MarkdownViewer file={doc.file} />}
                                    />
                                ))}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </div>
        </Router>
    )
}

export default App
