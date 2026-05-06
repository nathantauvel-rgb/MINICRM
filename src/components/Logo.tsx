import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 group">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-sm group-hover:bg-emerald-700 transition">
        M
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Mini<span className="text-emerald-600">CRM</span>
      </span>
    </Link>
  );
}
