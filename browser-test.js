// Browser-friendly test script for Supabase storage
// Copy and paste this into your browser console while on your app

async function testSupabaseStorage() {
  console.log('🔍 Testing Supabase storage configuration...');
  
  // Get the Supabase client from the page
  const supabase = window.supabase || createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // 1. Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Authentication error:', authError);
      return;
    }
    console.log('✅ Authentication successful:', user?.email);
    
    // 2. List all buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }
    console.log('✅ Available buckets:', buckets.map(b => b.name));
    
    // 3. Check if 'images' bucket exists
    const imagesBucket = buckets.find(bucket => bucket.name === 'images');
    if (!imagesBucket) {
      console.error('❌ "images" bucket not found');
      console.log('Available buckets:', buckets.map(b => b.name));
      return;
    }
    console.log('✅ "images" bucket found:', imagesBucket);
    
    // 4. Test bucket access
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 });
    
    if (listError) {
      console.error('❌ Error accessing images bucket:', listError);
      return;
    }
    console.log('✅ Successfully accessed images bucket');
    console.log('Files in bucket:', files);
    
    // 5. Test upload permissions (with a small test file)
    const testContent = 'test';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`test/${Date.now()}.txt`, testFile);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('Error details:', uploadError);
      return;
    }
    console.log('✅ Upload test successful:', uploadData);
    
    // 6. Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([uploadData.path]);
    
    if (deleteError) {
      console.error('⚠️ Could not delete test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    console.log('🎉 All storage tests passed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testSupabaseStorage(); 