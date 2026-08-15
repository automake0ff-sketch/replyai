export default function ProductHuntBadge({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 font-body text-xs font-medium text-ink/70 transition-colors hover:bg-ink/5"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DA552F] font-bold text-white">
        P
      </span>
      Featured on Product Hunt
    </a>
  );
}
