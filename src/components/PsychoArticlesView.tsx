import React, { useState } from 'react'
import {
  articleCategories,
  articleCatalog,
  ArticleItem,
} from '../data/toolsData'

interface PsychoArticlesViewProps {
  onBack: () => void
}

export function PsychoArticlesView({ onBack }: PsychoArticlesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null)

  const filteredArticles =
    selectedCategory === '全部'
      ? articleCatalog
      : articleCatalog.filter((a) => a.category === selectedCategory)

  return (
    <main className="screen articles-screen">
      <button
        className="back-button"
        onClick={activeArticle ? () => setActiveArticle(null) : onBack}
        aria-label="返回"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
          <path d="M9 12h11" />
        </svg>
      </button>

      <header className="page-title">
        <h1>{activeArticle ? activeArticle.title : '心理科普阅读'}</h1>
        <p>
          {activeArticle
            ? `${activeArticle.category} · 阅读时间 ${activeArticle.readTime}`
            : '用轻松易懂的方式，了解情绪规律与心理健康知识。'}
        </p>
      </header>

      {/* Article Detail View */}
      {activeArticle ? (
        <article className="article-reader-container">
          <div className="article-reader-header">
            <div className="reader-meta-row">
              <span className="reader-category">{activeArticle.category}</span>
              <span className="reader-time">⏱ {activeArticle.readTime}阅读</span>
            </div>
            <h2 className="reader-title">{activeArticle.title}</h2>
            <p className="reader-sub">{activeArticle.sub}</p>

            <div className="reader-tags">
              {activeArticle.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Key Takeaways Card */}
          <div className="article-takeaways-box">
            <h3 className="takeaways-title">
              <span>💡</span> 核心观点提要
            </h3>
            <ul className="takeaways-list">
              {activeArticle.keyTakeaways.map((point, idx) => (
                <li key={idx}>
                  <span className="bullet-leaf">🌱</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Full Paragraphs */}
          <div className="article-body">
            {activeArticle.paragraphs.map((para, idx) => (
              <p key={idx} className="article-para">
                {para}
              </p>
            ))}
          </div>

          <div className="article-reader-footer">
            <p className="reader-closure-tip">
              愿这份知识能像微风，给你带来片刻的轻松与释怀。
            </p>
            <button
              type="button"
              className="article-back-list-btn"
              onClick={() => setActiveArticle(null)}
            >
              ← 返回文章列表
            </button>
          </div>
        </article>
      ) : (
        /* Article Catalog List View */
        <section className="articles-list-container">
          <nav className="articles-category-nav" aria-label="文章分类">
            {articleCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="articles-grid">
            {filteredArticles.map((article) => (
              <div key={article.id} className="article-card">
                <div className="article-card-header">
                  <span className="article-category-badge">{article.category}</span>
                  <span className="article-time-badge">⏱ {article.readTime}</span>
                </div>

                <h3 className="article-card-title">{article.title}</h3>
                <p className="article-card-sub">{article.sub}</p>
                <p className="article-card-summary">{article.summary}</p>

                <div className="article-card-footer">
                  <div className="article-tags">
                    {article.tags.map((t) => (
                      <span key={t} className="tag-chip">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="article-read-btn"
                    onClick={() => setActiveArticle(article)}
                  >
                    阅读文章 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
