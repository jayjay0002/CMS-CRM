import { type DragEvent, useId, useRef, useState } from 'react'

import { saveErrorMessage } from '@/shared/api'
import { fieldAria, INPUT_CLASSES } from '@/shared/ui'

import { ACCEPTED_IMAGE_INPUT, IMAGE_RULES_TEXT } from '../config/limits'
import { imageFileProblem } from '../model/imageFile'
import { useUploadImage } from '../model/useUploadImage'

export type UploadedImage = { url: string; alt: string }

const SMALL_BUTTON =
  'rounded-full border-2 border-ink px-3 py-1 text-sm font-bold hover:bg-butter disabled:cursor-not-allowed disabled:opacity-50'

type Props = {
  // Prefix for element ids, unique on the page.
  id: string
  label: string
  image: UploadedImage | null
  onChange: (image: UploadedImage | null) => void
  altError?: string
  hint?: string
  altMaxLength: number
}

// Drop a file on it or click to choose one; shows a thumbnail with Replace/Remove and asks for
// a short description (alt text) so the photo works for screen readers too.
export function ImageUploadField({ id, label, image, onChange, altError, hint, altMaxLength }: Props) {
  const upload = useUploadImage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const statusId = useId()
  const altId = `${id}-alt`

  function start(file: File | undefined) {
    if (!file) return
    const fileProblem = imageFileProblem(file)
    setProblem(fileProblem)
    if (fileProblem) return
    upload.mutate(file, {
      onSuccess: (url) => onChange({ url, alt: image?.alt ?? '' }),
    })
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    start(event.dataTransfer.files[0])
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  const message = problem ?? (upload.isError ? saveErrorMessage(upload.error) : null)
  const dropClasses = isDragging ? 'border-cherry bg-butter-soft' : 'border-ink/40 bg-white'

  return (
    <fieldset className="space-y-3" aria-describedby={statusId}>
      <legend className="mb-1.5 font-semibold">{label}</legend>
      {hint && <p className="-mt-1 text-sm text-ink/65">{hint}</p>}

      <input
        ref={inputRef}
        id={`${id}-file`}
        type="file"
        accept={ACCEPTED_IMAGE_INPUT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          start(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <div
        onDragOver={onDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${dropClasses}`}
      >
        {image ? (
          <div className="flex flex-wrap items-center gap-4">
            <img src={image.url} alt="" className="size-24 rounded-xl border-2 border-ink object-cover" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
                className={SMALL_BUTTON}
              >
                Replace<span className="sr-only"> {label}</span>
              </button>
              <button type="button" onClick={() => onChange(null)} disabled={upload.isPending} className={SMALL_BUTTON}>
                Remove<span className="sr-only"> {label}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3 text-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
              className="rounded-full border-2 border-ink bg-butter px-4 py-2 text-sm font-bold hover:bg-butter-soft disabled:opacity-50"
            >
              Choose an image
            </button>
            <p className="text-sm text-ink/65">or drag one here. {IMAGE_RULES_TEXT}</p>
          </div>
        )}
        <p id={statusId} role="status" className="mt-2 text-sm font-semibold empty:hidden">
          {upload.isPending ? 'Uploading…' : ''}
        </p>
        {message && (
          <p role="alert" className="mt-2 text-sm font-semibold text-cherry-deep">
            {message}
          </p>
        )}
      </div>

      {image && (
        <div>
          <label htmlFor={altId} className="mb-1.5 block font-semibold">
            Describe the photo
          </label>
          <p id={`${altId}-hint`} className="-mt-1 mb-1.5 text-sm text-ink/65">
            A short sentence for people who can't see it, e.g. “Our red cart at a backyard wedding”.
          </p>
          <input
            id={altId}
            type="text"
            maxLength={altMaxLength}
            value={image.alt}
            onChange={(event) => onChange({ ...image, alt: event.target.value })}
            className={INPUT_CLASSES}
            {...fieldAria(altId, altError)}
          />
          {altError && (
            <p id={`${altId}-error`} className="mt-1.5 text-sm font-semibold text-cherry-deep">
              {altError}
            </p>
          )}
        </div>
      )}
    </fieldset>
  )
}
