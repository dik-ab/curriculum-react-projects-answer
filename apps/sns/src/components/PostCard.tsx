import { Post } from '../types';

type Props = {
  post: Post;
  currentUserId: number | null;
  onDelete: (postId: number) => void;
  onToggleLike: (post: Post) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP');
}

export function PostCard({
  post,
  currentUserId,
  onDelete,
  onToggleLike,
}: Props) {
  const isMine = currentUserId !== null && post.author.id === currentUserId;

  return (
    <article className="post-card">
      <div className="post-header">
        <a className="post-author-link" href={`#/users/${post.author.username}`}>
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={`${post.author.displayName}のアイコン`}
              className="avatar"
            />
          ) : (
            <span className="avatar avatar-placeholder">
              {post.author.displayName.charAt(0)}
            </span>
          )}
          <span>
            <span className="post-display-name">{post.author.displayName}</span>
            <span className="post-username">@{post.author.username}</span>
          </span>
        </a>
        <time className="post-date">{formatDate(post.createdAt)}</time>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button className="like-button" onClick={() => onToggleLike(post)}>
          {post.likedByMe ? 'いいね済み' : 'いいね'} {post.likeCount}
        </button>
        {isMine && (
          <button className="post-delete" onClick={() => onDelete(post.id)}>
            削除
          </button>
        )}
      </div>
    </article>
  );
}
