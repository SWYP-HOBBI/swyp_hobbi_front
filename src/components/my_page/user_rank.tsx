import SvgIcon from '../common/svg_icon';
import Tag from '../common/tag';
import LevelProgressBar from '../rank/level_progress_bar';

export default function UserRank() {
  const level = 1;
  const exp = 75;
  const label = '레드 호비';
  return (
    <div className="flex gap-6">
      <div>
        <div className="text-[20px] max-md:w-[390px] flex items-center space-x-2 font-semibold leading-[100%]">
          <span>나의 등급</span>
          <SvgIcon name="tooltip" size={12}></SvgIcon>
        </div>
        <div className="mt-6 mx-3 flex flex-col items-center justify-center space-y-2">
          <LevelProgressBar level={level} value={exp} />
          <span>Lv {level}</span>
          <Tag variant="white" label={label} />
        </div>
      </div>
      <div className="h-36 border-l border-grayscale-20 mt-[26px]"></div>
      <div className="text-[20px] max-md:w-[390px] font-semibold leading-[100%]">
        <span>챌린지</span>
      </div>
    </div>
  );
}
