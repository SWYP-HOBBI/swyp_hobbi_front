'use client';

import SearchContent from '@/components/search/search_content';
import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
