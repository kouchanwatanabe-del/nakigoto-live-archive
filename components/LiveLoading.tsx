
export default function LiveLoading() {
  return (
    <div
      role="status"
      aria-label="ライブ情報を読み込み中"
      className="flex min-h-[65vh] flex-col items-center justify-center bg-white px-4"
    >
      {/* 音楽イコライザー */}
      <div
        aria-hidden="true"
        className="flex h-14 items-center justify-center gap-[5px]"
      >
        {[18, 32, 48, 28, 20].map((height, index) => (
          <span
            key={index}
            className="w-[5px] rounded-full bg-[#14526B] motion-safe:animate-[equalizer_900ms_ease-in-out_infinite_alternate] motion-reduce:opacity-70"
            style={{
              height: `${height}px`,
              animationDelay: `${index * -170}ms`,
            }}
          />
        ))}
      </div>

      <p className="mt-6 text-lg font-bold tracking-[0.12em] text-[#14526B]">
        NOW LOADING
      </p>

      <p className="mt-2 text-xs text-zinc-400">
        Please wait...
      </p>
    </div>
  );
}
