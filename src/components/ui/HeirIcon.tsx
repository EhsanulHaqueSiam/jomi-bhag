export function HeirIcon({ isFeminine }: { isFeminine: boolean }) {
  return (
    <svg
      className="h-8 w-8 text-gray-400"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {isFeminine ? (
        <>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M12 12c-4 0-7 2.5-7 5.5 0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5 0-3-3-5.5-7-5.5z" />
        </>
      ) : (
        <>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M12 12c-3.5 0-6.5 2-6.5 5v1.5c0 .83.67 1.5 1.5 1.5h10c.83 0 1.5-.67 1.5-1.5V17c0-3-3-5-6.5-5z" />
        </>
      )}
    </svg>
  )
}
