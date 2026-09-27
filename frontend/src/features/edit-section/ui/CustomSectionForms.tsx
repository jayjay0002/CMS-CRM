import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

import { ImageUploadField } from '@/entities/media'
import {
  CONTENT_LIMITS,
  CTA_TARGETS,
  type CtaContent,
  type GalleryContent,
  IMAGE_SIDES,
  type StoryContent,
  type TextContent,
} from '@/entities/site'
import { useDraftReporting } from '@/shared/lib'
import { EditorShell } from '@/shared/ui'

import {
  ctaForm,
  type CtaFormValues,
  ctaSchema,
  galleryForm,
  type GalleryFormValues,
  gallerySchema,
  storyForm,
  type StoryFormValues,
  storySchema,
  textSchema,
} from '../model/schemas'
import type { SectionFormProps } from '../model/types'
import { ChoiceGroup } from './ChoiceGroup'
import { ListEditor, TextField } from './parts'

const STORY_BODY_ROWS = 10
const TEXT_BODY_ROWS = 12
const SHORT_ROWS = 3
const PARAGRAPH_HINT = 'Leave an empty line between paragraphs.'

const IMAGE_SIDE_OPTIONS = [
  { value: IMAGE_SIDES.left, label: 'Photo on the left' },
  { value: IMAGE_SIDES.right, label: 'Photo on the right' },
] as const

const CTA_TARGET_OPTIONS = [
  { value: CTA_TARGETS.book, label: 'Go to the booking form', description: 'Same as every Book button.' },
  { value: CTA_TARGETS.url, label: 'Open a link', description: 'Instagram, a menu PDF, anything with https://' },
] as const

export function StoryForm({ content, onSave, status, onDraftChange, onDirtyChange }: SectionFormProps<StoryContent>) {
  const form = useForm<StoryFormValues>({ resolver: zodResolver(storySchema), defaultValues: storyForm.toValues(content) })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const image = useWatch({ control, name: 'image' })
  useDraftReporting({ form, toDraft: storyForm.toContent, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(storyForm.toContent(values), () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField id="story-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="story-body"
        label="Story"
        hint={PARAGRAPH_HINT}
        rows={STORY_BODY_ROWS}
        registration={register('body')}
        error={errors.body?.message}
      />
      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <ImageUploadField
            id="story-image"
            label="Photo (optional)"
            image={field.value}
            onChange={field.onChange}
            altMaxLength={CONTENT_LIMITS.imageAlt}
            altError={errors.image?.alt?.message}
          />
        )}
      />
      {image && (
        <ChoiceGroup id="story-side" legend="Layout" options={IMAGE_SIDE_OPTIONS} registration={register('imageSide')} />
      )}
    </EditorShell>
  )
}

export function GalleryForm({
  content,
  onSave,
  status,
  onDraftChange,
  onDirtyChange,
}: SectionFormProps<GalleryContent>) {
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: galleryForm.toValues(content),
  })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const images = useFieldArray({ control, name: 'images' })
  useDraftReporting({ form, toDraft: galleryForm.toContent, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(galleryForm.toContent(values), () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField id="gallery-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="gallery-intro"
        label="Intro (optional)"
        rows={SHORT_ROWS}
        registration={register('intro')}
        error={errors.intro?.message}
      />
      {images.fields.length === 0 && (
        <p className="rounded-xl bg-butter-soft px-4 py-3 text-sm">
          The gallery stays off the website until it has at least one photo.
        </p>
      )}
      <ListEditor
        legend="Photos"
        itemNoun="photo"
        itemKeys={images.fields.map((field) => field.id)}
        minItems={0}
        maxItems={CONTENT_LIMITS.galleryMaxImages}
        onAdd={() => images.append({ image: null, caption: '' })}
        onMove={images.move}
        onRemove={images.remove}
        error={errors.images?.root?.message ?? errors.images?.message}
        renderItem={(index) => (
          <>
            <Controller
              control={control}
              name={`images.${index}.image`}
              render={({ field, fieldState }) => (
                <ImageUploadField
                  id={`gallery-${index}-image`}
                  label="Photo"
                  image={field.value}
                  onChange={field.onChange}
                  altMaxLength={CONTENT_LIMITS.imageAlt}
                  altError={errors.images?.[index]?.image?.alt?.message ?? fieldState.error?.message}
                />
              )}
            />
            <TextField
              id={`gallery-${index}-caption`}
              label="Caption (optional)"
              registration={register(`images.${index}.caption`)}
              error={errors.images?.[index]?.caption?.message}
            />
          </>
        )}
      />
    </EditorShell>
  )
}

// The form values already are the content.
const asText = (values: TextContent): TextContent => values

export function TextForm({ content, onSave, status, onDraftChange, onDirtyChange }: SectionFormProps<TextContent>) {
  const form = useForm<TextContent>({ resolver: zodResolver(textSchema), defaultValues: content })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  useDraftReporting({ form, toDraft: asText, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(values, () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField id="text-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="text-body"
        label="Text"
        hint={PARAGRAPH_HINT}
        rows={TEXT_BODY_ROWS}
        registration={register('body')}
        error={errors.body?.message}
      />
    </EditorShell>
  )
}

export function CtaForm({ content, onSave, status, onDraftChange, onDirtyChange }: SectionFormProps<CtaContent>) {
  const form = useForm<CtaFormValues>({ resolver: zodResolver(ctaSchema), defaultValues: ctaForm.toValues(content) })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const target = useWatch({ control, name: 'buttonTarget' })
  useDraftReporting({ form, toDraft: ctaForm.toContent, onDraftChange, onDirtyChange })

  const onSubmit = handleSubmit((values) => onSave(ctaForm.toContent(values), () => reset(values)))

  return (
    <EditorShell onSubmit={onSubmit} onDiscard={() => reset()} status={status} isDirty={isDirty}>
      <TextField id="cta-heading" label="Heading" registration={register('heading')} error={errors.heading?.message} />
      <TextField
        id="cta-body"
        label="Text (optional)"
        rows={SHORT_ROWS}
        registration={register('body')}
        error={errors.body?.message}
      />
      <TextField
        id="cta-button-label"
        label="Button text"
        registration={register('buttonLabel')}
        error={errors.buttonLabel?.message}
      />
      <ChoiceGroup id="cta-target" legend="The button should" options={CTA_TARGET_OPTIONS} registration={register('buttonTarget')} />
      {target === CTA_TARGETS.url && (
        <TextField
          id="cta-button-url"
          label="Link"
          hint="The page opens in a new tab."
          registration={register('buttonUrl')}
          error={errors.buttonUrl?.message}
        />
      )}
    </EditorShell>
  )
}
