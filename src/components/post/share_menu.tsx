import { copy } from '@/utils/copy';
import SvgIcon from '@/components/common/svg_icon';
import { URL } from '@/utils/utils';

interface ShareMenuProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareMenu({ url, isOpen, onClose }: ShareMenuProps) {
  if (!isOpen) return null;

  const handleUrlCopy = () => {
    copy(url);
    onClose();
  };

  const kakaoSend = (image: {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
  }) => {
    // SDK가 초기화될 때까지 대기
    const checkKakaoAndShare = () => {
      if (window.Kakao?.Share) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            ...image,
            title: 'HOBBi',
            description: '취미 공유 커뮤니티 사이트',
            link: {
              mobileWebUrl: URL,
              webUrl: URL,
            },
          },
          buttons: [
            {
              title: 'HOBBi 바로가기',
              link: {
                mobileWebUrl: URL,
                webUrl: URL,
              },
            },
          ],
        });
      } else {
        // SDK가 아직 준비되지 않았다면 100ms 후에 다시 시도
        setTimeout(checkKakaoAndShare, 100);
      }
    };

    checkKakaoAndShare();
  };

  const handleKakaoShare = () => {
    kakaoSend({
      imageUrl: '',
      imageWidth: 600,
      imageHeight: 450,
    });
    onClose();
  };

  return (
    <div className="absolute top-8 bg-grayscale-0 rounded-md shadow-lg w-[180px] h-[120px] border border-grayscale-20">
      <div className="flex flex-col items-center justify-center py-[21.5px]">
        <h3 className="text-grayscale-100 text-xs ">
          HOBBi 글을 공유해보세요.
        </h3>
        <div className="flex gap-6 mt-3">
          <button
            onClick={handleUrlCopy}
            className="flex flex-col items-center justify-center px-[12.5px] py-[15.5px] rounded-sm hover:bg-grayscale-5 transition-colors border border-grayscale-20"
          >
            URL
          </button>
          <button
            onClick={handleKakaoShare}
            className="flex flex-col items-center justify-center bg-[#FEE500] px-[12.5px] py-[15.5px] rounded-sm hover:bg-[#FEE500]/80 transition-colors"
          >
            <SvgIcon name="kakao" size={24} color="#000000" />
          </button>
        </div>
      </div>
    </div>
  );
}
