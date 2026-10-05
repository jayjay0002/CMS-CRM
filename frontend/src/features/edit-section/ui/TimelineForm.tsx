import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { ImageUploadField } from '@/entities/media'
import { CONTENT_LIMITS, type TimelineContent } from '@/entities/site'
import { useDraftReporting } from '@/shared/lib'
import { EditorShell } from '@/shared/ui'

import { timelineForm, type TimelineFormValues, timelineSchema } from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { ListEditor, TextField } from './parts'

const INTRO_ROWS = 3
const CHAPTER_BODY_ROWS = 4

export function TimelineForm({
  content,
  onSave,
  status,
  onDraftChange,
  onDirtyChange,
}: SectionFormProps<TimelineContent>) {
  const form = useForm<TimelineFormValues>({
    resolver: zodResolver(timelineSchema),
    defaultValues: timelineForm.toValues(content),
  })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const chapters = useFieldArray({ control, name: 'chapters' })
  useDraftReporting({ form, toDraft: timelineForm.toContent, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(timelineForm.toContent(values), () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField id="timeline-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="timeline-intro"
        label="Intro (optional)"
        rows={INTRO_ROWS}
        registration={register('intro')}
        error={errors.intro?.message}
      />
      {chapters.fields.length === 0 && (
        <p className="rounded-xl bg-butter-soft px-4 py-3 text-sm">
          The timeline stays off the website until it has at least one chapter.
        </p>
      )}
      <ListEditor
        legend="Chapters"
        itemNoun="chapter"
        itemKeys={chapters.fields.map((field) => field.id)}
        minItems={0}
        maxItems={CONTENT_LIMITS.timelineMaxChapters}
        onAdd={() =>
          chapters.append({ kicker: `Chapter ${chapters.fields.length + 1}`, title: '', body: '', image: null })
        }
        onMove={chapters.move}
        onRemove={chapters.remove}
        error={errors.chapters?.root?.message ?? errors.chapters?.message}
        renderItem={(index) => (
          <>
            <Controller
              control={control}
              name={`chapters.${index}.image`}
              render={({ field, fieldState }) => (
                <ImageUploadField
                  id={`timeline-${index}-image`}
                  label="Photo"
                  image={field.value}
                  onChange={field.onChange}
                  altMaxLength={CONTENT_LIMITS.imageAlt}
                  altError={errors.chapters?.[index]?.image?.alt?.message ?? fieldState.error?.message}
                />
              )}
            />
            <TextField
              id={`timeline-${index}-kicker`}
              label="Label"
              hint='Short, like "Chapter 1" or "Spring".'
              registration={register(`chapters.${index}.kicker`)}
              error={errors.chapters?.[index]?.kicker?.message}
            />
            <TextField
              id={`timeline-${index}-title`}
              label="Title"
              registration={register(`chapters.${index}.title`)}
              error={errors.chapters?.[index]?.title?.message}
            />
            <TextField
              id={`timeline-${index}-body`}
              label="Text"
              rows={CHAPTER_BODY_ROWS}
              registration={register(`chapters.${index}.body`)}
              error={errors.chapters?.[index]?.body?.message}
            />
          </>
        )}
      />
    </EditorShell>
  )
}
