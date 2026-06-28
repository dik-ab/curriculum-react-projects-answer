import { useCallback, useEffect, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { useHashRoute } from '../hooks/useHashRoute';
import { apiFetch } from '../lib/apiClient';
import type { Post, User, UserProfile } from '../types';

export default function UserPage() {
  const { path } = useHashRoute();
  const username = path.replace('/users/', '');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [profileData, postsData] = await Promise.all([
        apiFetch<UserProfile>(`/users/${username}`),
        apiFetch<Post[]>(`/users/${username}/posts`),
      ]);
      setProfile(profileData);
      setPosts(postsData);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  }, [username]);

  useEffect(() => {
    apiFetch<User>('/auth/me')
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    if (profile === null) return;
    try {
      await apiFetch(`/users/${username}/follow`, {
        method: profile.isFollowing ? 'DELETE' : 'POST',
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('この投稿を削除しますか？')) {
      return;
    }
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      await load();
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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'いいねの操作に失敗しました');
    }
  };

  if (profile === null) {
    return <p className="status-text">{error !== '' ? error : '読み込み中...'}</p>;
  }

  return (
    <div className="profile-page">
      {error !== '' && <p className="error">{error}</p>}
      <section className="profile-hero">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="アイコン" className="avatar avatar-large" />
        ) : (
          <span className="avatar avatar-large avatar-placeholder">
            {profile.displayName.charAt(0)}
          </span>
        )}
        <div className="profile-summary">
          <p className="eyebrow">Profile</p>
          <h1>{profile.displayName}</h1>
          <p className="profile-username">@{profile.username}</p>
          {profile.bio !== '' && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-stats">
            <span>フォロー {profile.followingCount}</span>
            <span>フォロワー {profile.followersCount}</span>
          </div>
        </div>
        <button className="profile-follow-button" onClick={toggleFollow}>
          {profile.isFollowing ? 'フォロー解除' : 'フォローする'}
        </button>
      </section>
      <section className="profile-posts">
        <div className="section-heading">
          <h2>投稿</h2>
        </div>
        {posts.length === 0 && <p className="empty-state">まだ投稿がありません。</p>}
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
      </section>
    </div>
  );
}
