// components/CursorOverlay.tsx

type CursorOverlayProps = {
  position: {
    x: number;
    y: number;
    username: string;
    color: string;
  };
};

export default function CursorOverlay({ position }: CursorOverlayProps) {
  return (
    <div
      className="absolute z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex flex-col items-center">
        <div
          className="text-xs font-medium bg-white px-2 py-0.5 rounded shadow-sm"
          style={{
            color: position.color,
            border: `1px solid ${position.color}`,
          }}
        >
          {position.username}
        </div>
        <div
          className="w-2.5 h-2.5 rounded-full mt-1"
          style={{ backgroundColor: position.color }}
        />
      </div>
    </div>
  );
}
