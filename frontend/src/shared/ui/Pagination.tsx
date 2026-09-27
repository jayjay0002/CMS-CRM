const FIRST_PAGE = 1

const PAGE_BUTTON =
  'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft disabled:cursor-not-allowed disabled:opacity-40'

type Props = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const lastPage = Math.max(FIRST_PAGE, Math.ceil(total / pageSize))
  const first = (page - FIRST_PAGE) * pageSize + FIRST_PAGE
  const last = Math.min(page * pageSize, total)

  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink/75" aria-live="polite">
        Showing {first}–{last} of {total}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - FIRST_PAGE)}
          disabled={page <= FIRST_PAGE}
          className={PAGE_BUTTON}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + FIRST_PAGE)}
          disabled={page >= lastPage}
          className={PAGE_BUTTON}
        >
          Next
        </button>
      </div>
    </nav>
  )
}
