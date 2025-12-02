import Link from 'next/link';

export default function SimpleFooter() {
  return (
    <footer className="bg-black text-offwhite pt-6 pb-10">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm">© 2025 Renvestment</div>
        <div className="flex gap-4 text-sm">
          <Link href="/">Privacy</Link>
          <span className="text-footer">|</span>
          <Link href="/">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
