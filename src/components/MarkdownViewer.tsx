import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

interface MarkdownViewerProps {
    file: string
}

// 한글 텍스트에서 ID 생성 (마크다운 표준 규칙)
const generateId = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\u3131-\u318E\uAC00-\uD7A3\s-]/g, '') // 한글, 영문, 숫자, 공백, 하이픈만 유지
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim()
}

// 헤더 텍스트 추출
const extractText = (children: any): string => {
    if (typeof children === 'string') {
        return children
    }
    if (Array.isArray(children)) {
        return children.map((c: any) => extractText(c)).join('')
    }
    if (children?.props?.children) {
        return extractText(children.props.children)
    }
    return String(children || '')
}

// 헤더에 ID를 추가하는 커스텀 컴포넌트
const headingWithId = (level: number) => {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
    return ({ children, ...props }: any) => {
        const text = extractText(children)
        const id = generateId(text)

        return (
            <HeadingTag id={id} {...props}>
                {children}
            </HeadingTag>
        )
    }
}

// 링크 컴포넌트 커스터마이징
const CustomLink = ({ href, children, ...props }: any) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (href && href.startsWith('#')) {
            e.preventDefault()
            const hash = href.substring(1)
            const id = decodeURIComponent(hash)

            // 요소 찾기
            let element = document.getElementById(id)

            if (!element) {
                // 모든 헤더를 순회하며 ID 비교
                const allHeaders = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
                allHeaders.forEach(header => {
                    const headerId = header.id
                    if (headerId === id || headerId === encodeURIComponent(id) || decodeURIComponent(headerId) === id) {
                        element = header as HTMLElement
                    }
                })
            }

            if (element) {
                const headerOffset = 80
                const elementPosition = element.getBoundingClientRect().top
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                })

                // URL 업데이트
                window.history.pushState(null, '', href)
            } else {
                console.warn(
                    'Element not found for hash:',
                    id,
                    'Available IDs:',
                    Array.from(document.querySelectorAll('h1[id], h2[id], h3[id]')).map(h => h.id)
                )
            }
        }
    }

    return (
        <a href={href} onClick={handleClick} {...props}>
            {children}
        </a>
    )
}

export default function MarkdownViewer({ file }: MarkdownViewerProps) {
    const [content, setContent] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const articleRef = useRef<HTMLElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/docs/${file}`)
            .then(res => res.text())
            .then(text => {
                setContent(text)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load markdown:', err)
                setContent('# 오류\n\n문서를 불러올 수 없습니다.')
                setLoading(false)
            })
    }, [file])

    // 콘텐츠 로드 후 해시 처리
    useEffect(() => {
        if (!loading && content && articleRef.current) {
            const handleHashScroll = () => {
                const hash = window.location.hash
                if (hash) {
                    setTimeout(() => {
                        const id = decodeURIComponent(hash.substring(1))
                        let element = document.getElementById(id)

                        if (!element) {
                            // 모든 헤더를 순회하며 ID 비교
                            const allHeaders = document.querySelectorAll(
                                'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'
                            )
                            allHeaders.forEach(header => {
                                const headerId = header.id
                                if (
                                    headerId === id ||
                                    headerId === encodeURIComponent(id) ||
                                    decodeURIComponent(headerId) === id
                                ) {
                                    element = header as HTMLElement
                                }
                            })
                        }

                        if (element) {
                            const headerOffset = 80
                            const elementPosition = element.getBoundingClientRect().top
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth',
                            })
                        }
                    }, 500)
                }
            }

            // 초기 로드 시 해시 확인
            handleHashScroll()

            // 해시 변경 감지
            window.addEventListener('hashchange', handleHashScroll)

            return () => {
                window.removeEventListener('hashchange', handleHashScroll)
            }
        }
    }, [loading, content])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
            </div>
        )
    }

    return (
        <article ref={articleRef} className="markdown-content animate-fade-in">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                    h1: headingWithId(1),
                    h2: headingWithId(2),
                    h3: headingWithId(3),
                    h4: headingWithId(4),
                    h5: headingWithId(5),
                    h6: headingWithId(6),
                    a: CustomLink,
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    )
}
