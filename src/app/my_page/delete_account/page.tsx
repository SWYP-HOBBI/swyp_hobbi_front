'use client';

import { userApi } from '@/api/user';
import SvgIcon from '@/components/common/svg_icon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// import { useAuthStore } from '@/store/auth';

export default function MyPageEdit() {
  const router = useRouter();
  // const logout = useAuthStore((state) => state.logout);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    '서비스 이용이 불편해요',
    '원하는 기능이 없어요',
    '동기부여가 안돼요',
    '이용 빈도가 낮아요.',
    '기타: 직접입력',
  ];

  const isSubmitEnabled = agreeChecked && selectedReason !== null;

  const handleDeleteAccount = async () => {
    if (!isSubmitEnabled) return;

    const reason =
      selectedReason === '기타: 직접입력' ? customReason : selectedReason;

    try {
      await userApi.deleteUser(reason); // 서버에 탈퇴 요청
      router.push('/my_page/delete_confirm'); // 완료 페이지로 이동
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <main className="w-full max-md:w-full min-h-screen bg-grayscale-0 flex flex-col justify-center items-center">
      {/* 모바일 전용 헤더 */}
      <div className="relative flex items-center justify-center mb-8 w-full md:hidden">
        <div className="absolute left-4" onClick={() => router.back()}>
          <SvgIcon
            name="arrow_left"
            className="cursor-pointer w-[20px] h-[20px]"
            color="var(--grayscale-60)"
          />
        </div>
        <h1 className="text-xl font-bold">회원 탈퇴 안내</h1>
      </div>

      <h1 className="text-[32px] max-md:hidden font-bold mb-6">
        회원 탈퇴 안내
      </h1>
      <p className="flex flex-col text-xl max-md:text-sm text-center mb-3">
        {/* 데스크탑 전용 */}
        <span className="max-md:hidden font-semibold">
          정말 떠나시겠어요? 탈퇴 시 계정과 관련된 모든 정보가 삭제되며, 복구가
          불가능합니다.
        </span>

        {/* 모바일 전용 */}
        <span className="max-md:text-sm md:hidden font-semibold">
          정말 떠나시겠어요?
        </span>
        <span className="md:hidden font-semibold">
          탈퇴 시 계정과 관련된 모든 정보가 삭제되며, 복구가 불가능합니다.
        </span>

        <span className="font-semibold">
          작성한 게시글, 댓글 등의 일부 데이터는 삭제되지 않을 수 있습니다.
        </span>
      </p>

      <div
        className="flex items-center mb-[48px] cursor-pointer"
        onClick={() => setAgreeChecked((prev) => !prev)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="mr-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 3C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H5ZM16.95 9.796C17.1376 9.60849 17.2431 9.35412 17.2432 9.08885C17.2433 8.82358 17.138 8.56914 16.9505 8.3815C16.763 8.19386 16.5086 8.08839 16.2434 8.0883C15.9781 8.0882 15.7236 8.19349 15.536 8.381L10.586 13.331L8.465 11.21C8.37216 11.1171 8.26192 11.0434 8.14059 10.9931C8.01926 10.9428 7.8892 10.9168 7.75785 10.9168C7.49258 10.9167 7.23814 11.022 7.0505 11.2095C6.86286 11.397 6.75739 11.6514 6.7573 11.9166C6.7572 12.1819 6.86249 12.4364 7.05 12.624L9.808 15.382C10.0314 15.605 10.3076 15.7044 10.586 15.7044C10.8644 15.7044 11.1406 15.605 11.364 15.382L16.95 9.796Z"
            fill={agreeChecked ? 'var(--like)' : 'var(--grayscale-20)'}
          />
        </svg>
        <label
          className={`text-[18px]  cursor-pointer max-md:text-[15px] ${
            agreeChecked ? 'text-[var(--like)]' : 'text-[var(--grayscale-40)]'
          }`}
        >
          안내 사항을 모두 확인하였으며, 탈퇴에 동의합니다.
        </label>
      </div>

      <div className="w-[816px] max-md:w-full border border-[#9B9B9B] rounded-[24px] p-[32px] mb-[48px]">
        <div className="text-[18px] mb-6">
          서비스 개선을 위해 아래 중 해당하는 탈퇴 사유를 선택해주세요.
          (단수선택)
        </div>
        <div className="flex flex-col gap-4">
          {reasons.map((reason, idx) => (
            <label
              key={idx}
              className="flex items-center cursor-pointer text-[16px]"
              onClick={() => setSelectedReason(reason)}
            >
              <div
                className={`w-5 h-5 mr-3 rounded-full border border-[#C4C4C4] flex items-center justify-center ${
                  selectedReason === reason
                    ? 'bg-[var(--primary)] border-none'
                    : 'bg-grayscale-0'
                }`}
              >
                {selectedReason === reason && (
                  <div className="w-2.5 h-2.5 rounded-full bg-grayscale-0"></div>
                )}
              </div>
              {reason}
            </label>
          ))}
          {selectedReason === '기타: 직접입력' && (
            <input
              type="text"
              placeholder="사유를 입력해주세요"
              className="mt-2 border border-[#C4C4C4] rounded-[8px] px-4 py-2 text-[16px]"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="flex gap-4 max-md:w-[390px]">
        <button
          className="w-[475px] h-[72px] text-sm text-[var(--primary-b60)] font-semibold rounded-[12px] border border-[1.5px] border-[var(--primary-b60)] hover:bg-gray-100 max-md:hidden"
          onClick={() => router.push('/edit')}
        >
          돌아가기
        </button>
        <button
          className={`w-[475px] h-[72px] text-sm font-semibold rounded-[12px] ${
            isSubmitEnabled
              ? 'bg-[var(--primary)] hover:bg-[var(--primary-b80)]'
              : 'bg-[var(--grayscale-10)] text-[var(--grayscale-50)] cursor-not-allowed'
          }`}
          disabled={!isSubmitEnabled}
          onClick={handleDeleteAccount}
        >
          탈퇴하기
        </button>
      </div>
    </main>
  );
}
