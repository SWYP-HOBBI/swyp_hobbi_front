'use client';

import Tag from '@/components/common/tag';

export default function Home() {
  return (
    <div>
      <h1>Login</h1>
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
    </div>
  );
}
