import SvgIcon from './svg_icon';

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen space-x-2">
      <div className="animate-bounce [animation-delay:-0.3s]">
        <SvgIcon name="loader" color="var(--primary)" size={20} />
      </div>
      <div className="animate-bounce [animation-delay:-0.15s]">
        <SvgIcon name="loader" color="var(--primary)" size={20} />
      </div>
      <div className="animate-bounce">
        <SvgIcon name="loader" color="var(--primary)" size={20} />
      </div>
    </div>
  );
}
