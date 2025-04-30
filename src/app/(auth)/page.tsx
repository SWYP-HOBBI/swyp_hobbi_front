'use client';

import SvgIcon from '@/components/common/svg_icon';
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
      <SvgIcon name="checkbox_on" color="var(--color-primary)" size={25} />
      <SvgIcon name="checkbox_off" color="var(--grayscale-20)" />
      <SvgIcon name="heart" color="var(--color-like)" />
      <SvgIcon name="eye_on" color="var(--grayscale-60)" />
      <SvgIcon name="eye_off" color="var(--grayscale-20)" />
      <SvgIcon name="home" color="var(--grayscale-40)" />
      <SvgIcon name="my_page" color="var(--grayscale-40)" />
      <SvgIcon name="alarm" color="var(--grayscale-40)" />
      <SvgIcon name="search" color="var(--grayscale-40)" />
      <SvgIcon name="write" color="var(--grayscale-40)" />
      <SvgIcon name="camera" color="var(--grayscale-100)" />
      <SvgIcon name="chat" color="var(--grayscale-100)" />
      <SvgIcon name="share" color="var(--grayscale-100)" />
      <SvgIcon name="setting" color="var(--grayscale-100)" />
      <SvgIcon name="add" color="var(--grayscale-100)" />
      <SvgIcon name="arrow_left" color="var(--grayscale-100)" />
      <SvgIcon name="arrow_down" color="var(--grayscale-100)" />
      <SvgIcon name="delete" color="var(--grayscale-100)" />
      <SvgIcon name="meatball" color="var(--grayscale-100)" />
      <SvgIcon
        name="logo"
        color="var(--grayscale-100)"
        width={150}
        height={44}
      />
    </div>
  );
}
