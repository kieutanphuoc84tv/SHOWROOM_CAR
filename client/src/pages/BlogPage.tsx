import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { apiFetch } from '../lib/api'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string
  author: { fullName: string; avatarUrl: string | null }
}

function BlogPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      apiFetch<{ data: BlogPost[] }>('/api/blogs', {
        method: 'GET',
      }).then((res) => setPosts(res.data || []))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="bg-surface-base min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white py-20">
        <div className="site-container text-center">
          <p className="section-eyebrow text-amber-400 mb-2">{t('nav.news_blog')}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tin tức & Bài viết</h1>
          <p className="text-neutral-300 max-w-xl mx-auto text-[14px]">
            Cập nhật xu hướng xe hơi, đánh giá chi tiết và bí quyết chọn xe phù hợp.
          </p>
        </div>
      </section>

      {/* Search */}
      <div className="site-container pt-8">
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mx-auto block px-4 py-2.5 rounded-xl border border-black/10 text-[14px] focus:ring-2 focus:ring-amber-500/30 outline-none"
        />
      </div>

      {/* Grid */}
      <div className="site-container py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-black/5 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-neutral-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-neutral-100 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-full" />
                  <div className="h-3 bg-neutral-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-[14px]">Chưa có bài viết nào. Hãy quay lại sau!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group rounded-2xl bg-white border border-black/5 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="aspect-[16/10] bg-neutral-100 overflow-hidden">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-4xl">📰</div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-[16px] mb-2 line-clamp-2 group-hover:text-amber-600 transition">{post.title}</h2>
                  <p className="text-[13px] text-text-secondary line-clamp-3 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-[12px] text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {post.author?.fullName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage
