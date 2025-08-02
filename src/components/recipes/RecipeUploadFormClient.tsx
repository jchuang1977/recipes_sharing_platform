'use client';
import { useState } from 'react';
import { RecipeUploadForm } from './RecipeUploadForm';

interface RecipeUploadFormClientProps {
  children?: (refreshKey: number) => React.ReactNode;
}

export function RecipeUploadFormClient({ children }: RecipeUploadFormClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <RecipeUploadForm onUpload={() => setRefreshKey(k => k + 1)} />
      {children?.(refreshKey)}
    </>
  );
} 