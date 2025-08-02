'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { CommentWithUser } from '../../types/supabase';

interface RecipeCommentsProps {
  recipeId: string;
  initialCommentCount: number;
  onCommentChange?: (newCount: number) => void;
}

export function RecipeComments({ 
  recipeId, 
  initialCommentCount, 
  onCommentChange 
}: RecipeCommentsProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchComments();
  }, [recipeId]);



  const fetchComments = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching comments for recipe:', recipeId);
      const response = await fetch(`/api/recipes/${recipeId}/comments`);
      console.log('Comments response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Comments data:', data);
        setComments(data.comments || []);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting comment:', { recipeId, content: newComment });
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      console.log('Submit response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Submit response data:', data);
        setComments(prev => {
          const newComments = [data.comment, ...prev];
          // Update comment count in parent with the new count
          onCommentChange?.(newComments.length);
          return newComments;
        });
        setNewComment('');
      } else {
        const errorData = await response.json();
        console.error('Submit error response:', errorData);
        alert('Failed to post comment: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const { comment } = await response.json();
        setComments(prev => 
          prev.map(c => c.id === commentId ? comment : c)
        );
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => {
          const newComments = prev.filter(c => c.id !== commentId);
          // Update comment count in parent with the new count
          onCommentChange?.(newComments.length);
          return newComments;
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          rows={3}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {newComment.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
        
        {isLoading ? (
          <div className="text-center text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500">No comments yet. Be the first to comment!</div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      @{comment.user_profile.user_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                    {comment.is_edited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {editContent.length}/1000 characters
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editContent.trim()}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 