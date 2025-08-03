import { createSupabaseServerClient } from '../../../../../src/utils/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

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

    // Check if user already liked the recipe
    const { data: existingLike } = await supabase
      .from('recipe_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .single();

    if (existingLike) {
      // Unlike the recipe
      const { error } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) {
        console.error('Error unliking recipe:', error);
        return NextResponse.json(
          { error: 'Failed to unlike recipe' },
          { status: 500 }
        );
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like the recipe
      const { error } = await supabase
        .from('recipe_likes')
        .insert({
          user_id: user.id,
          recipe_id: recipeId
        });

      if (error) {
        console.error('Error liking recipe:', error);
        return NextResponse.json(
          { error: 'Failed to like recipe' },
          { status: 500 }
        );
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error in like endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 