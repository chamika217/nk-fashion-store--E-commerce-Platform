import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 bg-ivory flex flex-col items-center justify-center py-32 px-6 text-center">
      {/* 404 numeral */}
      <p className="font-serif text-7xl sm:text-8xl font-bold text-rose leading-none">
        404
      </p>

      {/* Heading */}
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-4">
        We couldn&apos;t find that page.
      </h1>

      {/* Supporting line */}
      <p className="text-gray text-sm sm:text-base mt-3 max-w-sm">
        The page you&apos;re looking for might have been moved or no longer
        exists.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
        <Link
          href="/"
          className="w-full sm:w-auto bg-ink text-ivory text-sm font-medium px-8 py-3 rounded-full hover:bg-rose transition-colors duration-200 text-center"
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="w-full sm:w-auto border border-gray-light text-ink text-sm font-medium px-8 py-3 rounded-full hover:border-rose transition-colors duration-200 text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
