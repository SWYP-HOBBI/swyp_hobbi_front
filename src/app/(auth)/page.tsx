'use client';

import Button from '@/components/common/button';
import SvgIcon from '@/components/common/svg_icon';
import Tag from '@/components/common/tag';
import TestModal from '@/components/common/test_modal';
import Input from '@/components/common/input';
import { useState } from 'react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

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
      <SvgIcon name="logo" color="var(--grayscale-100)" width={150} height={44} />
      <Button type="button" onClick={() => alert('click')} variant="primary">
        Button
      </Button>
      <Button type="button" variant="outline" fullWidth>
        Button
      </Button>
      <Button type="button" variant="secondary">
        Button
      </Button>

      <Input
        label="Label"
        placeholder="TEXT"
        value={inputValue}
        required
        onChange={handleInputChange}
      />
      <Input
        placeholder="TEXT"
        showClearButton
        value={inputValue}
        onChange={handleInputChange}
      />
      <Input
        type="password"
        placeholder="TEXT"
        showPasswordToggle
        showClearButton
        value={inputValue}
        disabled
        onChange={handleInputChange}
        helperText="helperText"
      />
      <Input
        placeholder="TEXT"
        error="*유효하지 않은 입력입니다."
        showPasswordToggle
        showClearButton
        value={inputValue}
        onChange={handleInputChange}
      />
    </div>
  );
}
