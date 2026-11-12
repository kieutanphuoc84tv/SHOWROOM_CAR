import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Link2 } from 'lucide-react'
import { apiFetch } from '../lib/api'

interface BlogDetail {
  id: string
  title: string
  slug: string
  content: string
  coverImage: string | null
  publishedAt: string
  author: { fullName: string; avatarUrl: string | null }
}

function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    apiFetch<BlogDetail>(`/api/blogs/${slug}`)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  const handleCopyLink = () => {
    navigator.clipboard.writeCopy(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="site-container py-20 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-100 rounded w-3/4" />
          <div className="h-64 bg-neutral-100 rounded-2xl" />
          <div className="h-4 bg-neutral-100 rounded w-full" />
          <div className="h-4 bg-neutral-100 rounded w-5/6" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="site-container py-20 text-center">
        <p className="text-5xl mb-4">📭</p>
        <h1 className="text-xl font-bold mb-2">Bài viết không tồn tại</h1>
        <p className="text-text-secondary text-[14px] mb-6">Bài viết này có thể đã bị xóa hoặc không tồn tại.</p>
        <button onClick={() => navigate('/blog')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full text-[14px]">
          <ArrowLeft className="w-4 h-4" /> Quay lại Blog
        </button>
      </div>
    )
  }

  return (
    <article className="bg-surface-base">
      {/* Back */}
      <div className="site-container pt-8">
        <button onClick={() => navigate('/blog')} className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại Blog
        </button>
      </div>

      {/* Header */}
      <header className="site-container max-w-3xl py-10">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-[13px] text-text-secondary">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {post.author?.fullName}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.publishedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="site-container max-w-4xl mb-10">
          <img src={post.coverImage} alt={post.title} className="w-full aspect-[16/8] object-cover rounded-2xl" />
        </div>
      )}

      {/* Content */}
      <div className="site-container max-w-3xl pb-10">
        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </div>

      {/* Share */}
      <div className="site-container max-w-3xl pb-16">
        <div className="flex items-center gap-3 border-t border-black/5 pt-6">
          <span className="text-[13px] text-text-secondary flex items-center gap-1.5"><Share2 className="w-4 h-4" /> Chia sẻ:</span>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener" className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
            <Facebook className="w-4 h-4" />
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener" className="p-2 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition">
            <Twitter className="w-4 h-4" />
          </a>
          <button onClick={handleCopyLink} className="p-2 rounded-full bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition">
            <Link2 className="w-4 h-4" />
          </button>
          {copied && <span className="text-[12px] text-green-600">Đã sao chép!</span>}
        </div>
      </div>
    </article>
  )
}

export default BlogDetailPage
