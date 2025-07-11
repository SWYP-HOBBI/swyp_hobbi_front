import { copy } from '@/utils/copy';
import SvgIcon from '@/components/common/svg_icon';
import { URL } from '@/utils/utils';

/**
 * 공유 메뉴 Props 인터페이스
 *
 * 공유 메뉴 컴포넌트에 전달되는 속성들을 정의합니다.
 *
 * @param url - 공유할 게시글의 URL
 * @param isOpen - 공유 메뉴 열림/닫힘 상태
 * @param onClose - 공유 메뉴 닫기 콜백 함수
 */
interface ShareMenuProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 게시글 공유 메뉴 컴포넌트
 *
 * 게시글을 다양한 방법으로 공유할 수 있는 드롭다운 메뉴입니다.
 *
 * 주요 기능:
 * 1. URL 복사 기능 (클립보드에 복사)
 * 2. 카카오톡 공유 기능 (Kakao SDK 활용)
 * 3. 조건부 렌더링 (isOpen 상태에 따라 표시/숨김)
 * 4. 공유 후 자동 메뉴 닫기
 *
 * 공유 방법:
 * - URL 복사: 게시글 링크를 클립보드에 복사
 * - 카카오톡 공유: 카카오톡 앱을 통해 게시글 공유
 *
 * 기술적 특징:
 * - Kakao SDK를 활용한 카카오톡 공유
 * - 클립보드 API를 통한 URL 복사
 * - 조건부 렌더링으로 성능 최적화
 * - 호버 효과로 사용자 피드백 제공
 *
 * 사용자 경험:
 * - 직관적인 공유 버튼 UI
 * - 공유 후 자동 메뉴 닫기
 * - 호버 시 시각적 피드백
 * - 모바일/데스크톱 대응
 *
 * 카카오톡 공유 정보:
 * - 앱 이름: HOBBi
 * - 설명: 취미 공유 커뮤니티 사이트
 * - 버튼: "HOBBi 바로가기"
 * - 이미지: 600x450 크기 (기본값)
 */
export default function ShareMenu({ url, isOpen, onClose }: ShareMenuProps) {
  // ===== 조건부 렌더링 =====

  /**
   * 공유 메뉴가 닫혀있으면 렌더링하지 않음
   *
   * 성능 최적화를 위해 불필요한 DOM 요소 생성을 방지합니다.
   * isOpen이 false일 때 null을 반환하여 컴포넌트가 렌더링되지 않습니다.
   */
  if (!isOpen) return null;

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * URL 복사 처리
   *
   * 게시글 URL을 클립보드에 복사하고 공유 메뉴를 닫습니다.
   *
   * 처리 과정:
   * 1. copy 유틸리티 함수를 사용하여 URL을 클립보드에 복사
   * 2. 복사 완료 후 공유 메뉴 자동 닫기
   *
   * 사용자 경험:
   * - 복사 완료 시 시각적 피드백 (copy 함수 내부에서 처리)
   * - 메뉴 자동 닫기로 불필요한 클릭 제거
   */
  const handleUrlCopy = () => {
    copy(url);
    onClose();
  };

  /**
   * 카카오톡 공유 실행 함수
   *
   * Kakao SDK를 사용하여 카카오톡으로 게시글을 공유합니다.
   *
   * 특징:
   * - SDK 초기화 대기 로직 포함
   * - 재귀적 재시도로 안정성 확보
   * - 커스텀 이미지 및 메타데이터 설정
   *
   * @param image - 공유할 이미지 정보 (URL, 너비, 높이)
   */
  const kakaoSend = (image: {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
  }) => {
    /**
     * Kakao SDK 초기화 확인 및 공유 실행
     *
     * SDK가 완전히 로드될 때까지 대기한 후 공유를 실행합니다.
     *
     * 동작 방식:
     * 1. window.Kakao?.Share 존재 여부 확인
     * 2. 존재하면 공유 실행
     * 3. 존재하지 않으면 100ms 후 재시도
     * 4. 재귀적으로 SDK 준비될 때까지 반복
     */
    const checkKakaoAndShare = () => {
      if (window.Kakao?.Share) {
        // ===== 카카오톡 공유 실행 =====
        window.Kakao.Share.sendDefault({
          objectType: 'feed', // 피드 형태의 공유
          content: {
            ...image, // 전달받은 이미지 정보
            title: 'HOBBi', // 공유 제목
            description: '취미 공유 커뮤니티 사이트', // 공유 설명
            link: {
              mobileWebUrl: URL, // 모바일 웹 URL
              webUrl: URL, // 데스크톱 웹 URL
            },
          },
          buttons: [
            {
              title: 'HOBBi 바로가기', // 공유 버튼 텍스트
              link: {
                mobileWebUrl: URL, // 모바일 웹 URL
                webUrl: URL, // 데스크톱 웹 URL
              },
            },
          ],
        });
      } else {
        // ===== SDK 초기화 대기 =====
        // SDK가 아직 준비되지 않았다면 100ms 후에 다시 시도
        setTimeout(checkKakaoAndShare, 100);
      }
    };

    // ===== 공유 프로세스 시작 =====
    checkKakaoAndShare();
  };

  /**
   * 카카오톡 공유 버튼 클릭 처리
   *
   * 카카오톡 공유를 실행하고 공유 메뉴를 닫습니다.
   *
   * 설정값:
   * - 이미지 URL: 빈 문자열 (기본 이미지 사용)
   * - 이미지 크기: 600x450 (카카오톡 권장 크기)
   *
   * 사용자 경험:
   * - 공유 실행 후 메뉴 자동 닫기
   * - 카카오톡 앱으로 자동 이동
   */
  const handleKakaoShare = () => {
    kakaoSend({
      imageUrl: '', // 빈 문자열로 기본 이미지 사용
      imageWidth: 600, // 카카오톡 권장 너비
      imageHeight: 450, // 카카오톡 권장 높이
    });
    onClose();
  };

  // ===== 메인 렌더링 =====
  return (
    <div className="absolute top-8 bg-grayscale-0 rounded-md shadow-lg w-[180px] h-[120px] border border-grayscale-20">
      {/* ===== 공유 메뉴 컨테이너 ===== */}
      <div className="flex flex-col items-center justify-center py-[21.5px]">
        {/* ===== 메뉴 제목 ===== */}
        <h3 className="text-grayscale-100 text-xs ">
          HOBBi 글을 공유해보세요.
        </h3>

        {/* ===== 공유 버튼 영역 ===== */}
        <div className="flex gap-6 mt-3">
          {/* ===== URL 복사 버튼 ===== */}
          <button
            onClick={handleUrlCopy}
            className="flex flex-col items-center justify-center px-[12.5px] py-[15.5px] rounded-sm hover:bg-grayscale-5 transition-colors border border-grayscale-20"
            /**
             * URL 복사 버튼
             *
             * 스타일링:
             * - 테두리 있는 버튼 디자인
             * - 호버 시 배경색 변경
             * - 부드러운 전환 효과
             * - 중앙 정렬된 텍스트
             */
          >
            URL
          </button>

          {/* ===== 카카오톡 공유 버튼 ===== */}
          <button
            onClick={handleKakaoShare}
            className="flex flex-col items-center justify-center bg-[#FEE500] px-[12.5px] py-[15.5px] rounded-sm hover:bg-[#FEE500]/80 transition-colors"
            /**
             * 카카오톡 공유 버튼
             *
             * 스타일링:
             * - 카카오톡 브랜드 색상 (#FEE500)
             * - 호버 시 투명도 변경
             * - 카카오톡 아이콘 포함
             * - 부드러운 전환 효과
             */
          >
            <SvgIcon name="kakao" size={24} color="#000000" />
          </button>
        </div>
      </div>
    </div>
  );
}
