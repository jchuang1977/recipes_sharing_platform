import { createSupabaseServerClient } from '../../../../../src/utils/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

// GET comments for a recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { slug } = await params;
    const recipeId = slug[0]; // First part of the slug is the recipe ID

    const { data: comments, error } = await supabase
      .from('recipe_comments')
      .select('*')
      .eq('recipe_id', recipeId)
      .is('parent_id', null) // Only get top-level comments
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Fetch user profiles for comments
    const commentsWithUsers = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('user_name, full_name')
          .eq('user_id', comment.user_id)
          .single();
        
        return {
          ...comment,
          user_profile: userProfile || { user_name: 'Unknown', full_name: null }
        };
      })
    );

    return NextResponse.json({ comments: commentsWithUsers });
  } catch (error) {
    console.error('Error in comments GET endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const recipeId = slug[0]; // First part of the slug is the recipe ID
    const { content, parent_id } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const { data: comment, error } = await supabase
      .from('recipe_comments')
      .insert({
        user_id: user.id,
        recipe_id: recipeId,
        content: content.trim(),
        parent_id: parent_id || null
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Fetch user profile for the new comment
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_name, full_name')
      .eq('user_id', user.id)
      .single();

    const commentWithUser = {
      ...comment,
      user_profile: userProfile || { user_name: 'Unknown', full_name: null }
    };

    return NextResponse.json({ comment: commentWithUser });
  } catch (error) {
    console.error('Error in comments POST endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 