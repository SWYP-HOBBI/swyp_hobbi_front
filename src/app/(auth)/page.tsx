'use client';

import Tag from '@/components/common/tag';
import TestModal from '@/components/common/test_modal';

export default function Home() {
  return (
    <div>
      <div className="tag_container">
        <Tag
          label="Tag"
          onDelete={() => {
            console.log('delete');
          }}
        />

        <Tag
          label="Tag"
          variant="white"
          onDelete={() => {
            console.log('delete');
          }}
        />

        <Tag
          label="Tag"
          variant="gray"
          onDelete={() => {
            console.log('delete');
          }}
        />
      </div>
      <TestModal />
    </div>
  );
}
