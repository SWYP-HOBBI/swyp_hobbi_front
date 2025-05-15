'use client';

import PasswordFind from '@/components/auth/password_find';
import SvgIcon from '@/components/common/svg_icon';

export default function FindPassword() {
  return (
    <div className="flex flex-col items-center px-4 py-8 w-full shadow-md rounded-3xl">
      <div className="mb-4">
        <SvgIcon
          name="logo"
          width={120}
          height={35}
          className="max-md:hidden"
        />
      </div>
      <PasswordFind />
    </div>
  );
}
