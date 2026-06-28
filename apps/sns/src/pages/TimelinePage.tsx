import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { Post, User } from '../types';
import { PostCard } from '../components/PostCard';

type Tab = 'all' | 'following';

export default function TimelinePage() {
  const [tab, setTab] = useState<Tab>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      const url = tab === 'all' ? '/posts' : '/posts/timeline';
      const data = await apiFetch<Post[]>(url);
      setPosts(data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    apiFetch<User>('/auth/me')
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() === '') {
      return;
    }
    try {
      await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : '投稿に失敗しました');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('この投稿を削除しますか？')) {
      return;
    }
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました');
    }
  };

  const handleToggleLike = async (post: Post) => {
    try {
      if (post.likedByMe) {
        await apiFetch(`/posts/${post.id}/likes`, { method: 'DELETE' });
      } else {
        await apiFetch(`/posts/${post.id}/likes`, { method: 'POST' });
      }
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'いいねの操作に失敗しました');
    }
  };

  if (loading) {
    return <p className="status-text">読み込み中...</p>;
  }

  return (
    <div className="timeline">
      <section className="composer">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Timeline</p>
            <h1>タイムライン</h1>
          </div>
        </div>
        <form className="post-form" onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="いまどうしてる？"
          />
          <div className="post-form-footer">
            <span className="char-count">{content.length}/280</span>
            <button type="submit" disabled={content.trim() === ''}>
              投稿する
            </button>
          </div>
        </form>
      </section>

      <div className="tab-list" aria-label="タイムライン種別">
        <button
          className={tab === 'all' ? 'tab-button tab-button-active' : 'tab-button'}
          onClick={() => setTab('all')}
          disabled={tab === 'all'}
        >
          全体
        </button>
        <button
          className={
            tab === 'following' ? 'tab-button tab-button-active' : 'tab-button'
          }
          onClick={() => setTab('following')}
          disabled={tab === 'following'}
        >
          フォロー中
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {posts.length === 0 ? (
        <p className="empty-state">
          {tab === 'following'
            ? 'フォロー中のユーザーの投稿がまだありません。'
            : 'まだ投稿がありません。最初の投稿をしてみましょう。'}
        </p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={me?.id ?? null}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}
