# Storytelling Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retell the landing page as the founder's story of a hand-restored 1907 popcorn wagon, with a new CMS-editable Timeline section and a one-time `apply-story` command that puts it live.

**Architecture:** A new custom section type `timeline` in the backend `content` module (enum value, Pydantic schema, migration), mirrored on the frontend (`entities/site` types, an `edit-section` form, a `landing-page` widget). New copy lives in `content/defaults.py` (built-ins and settings) and `content/story.py` (Story, Timeline and CTA content plus photo list). `content/apply_story.py` uploads the bundled photos through the media module's public API and rewrites the page in one transaction.

**Tech Stack:** FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, pytest (pgserver); React, TypeScript, react-hook-form + zod, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-06-storytelling-landing-design.md` (the copy deck lives there; the code below copies it verbatim).

## Global Constraints

- Follow `AGENTS.md`: no magic values (named constants), no `noqa`/lint disables, files ≤ ~300 lines, functions ≤ ~40 lines, module imports only via `__init__.py`.
- Done = `uv run ruff check . && uv run ruff format --check . && uv run pytest` (backend/) and `npm run lint && npm run build` (frontend/).
- Copy voice: founder, first person; no names of people/places, no restoration dates.
- Contact facts: phone `(404) 682-6707` / `+14046826707`, email `info@theredpopcornwagon.com`.
- Timeline limits: max 8 chapters, chapter body ≤ 400 chars, kicker = `Label` (40), title = `Heading` (60).
- No commits unless the user asks; no AI attribution in any commit.

## Review Focus

1. Running `apply-story` twice: must refuse the second time and change nothing (test in Task 3).
2. A photo upload failing midway: no DB content changes (test in Task 3: uploader raises → settings unchanged).
3. A site where the owner already added custom sections: they survive, placed just before Booking (test in Task 3).
4. A newly added, empty timeline: hidden on the public page and in the admin preview (tests in Task 1; mirrored in Task 4).
5. Reduced-motion visitors and phones: the timeline is fully readable with no animation and a single column (visual check in Task 7).

---

### Task 1: Backend `timeline` section type

**Files:**
- Modify: `backend/app/modules/content/enums.py`, `constants.py`, `schemas.py`, `service.py` (`_has_public_content`, `add_section` message), `defaults.py` (`NEW_SECTION_CONTENT`)
- Create: `backend/alembic/versions/2026_10_06_1200-b7c1d2e3f4a5_timeline_section.py`
- Test: `backend/tests/modules/content/test_timeline.py`

**Interfaces:**
- Produces: `SectionType.TIMELINE`, `TimelineContent`, `TimelineChapter`, `TIMELINE_MAX_CHAPTERS = 8`, `TIMELINE_CHAPTER_BODY_MAX_LENGTH = 400`.

- [ ] **Step 1: Write failing tests** in `tests/modules/content/test_timeline.py`, reusing the fixtures and helpers from `test_content.py` (import `admin_headers`, `seeded`, `hosted_image`, `section_id`, `ADMIN_URL`, `SITE_URL`, `public_types`):

```python
def chapter(index: int = 1) -> dict[str, Any]:
    return {"kicker": f"Chapter {index}", "title": "Down to the bones",
            "body": "A bare frame.", "image": hosted_image(f"{index}.jpg")}

def add_timeline(client, headers) -> dict[str, Any]:
    return client.post(f"{ADMIN_URL}/sections", json={"type": "timeline"}, headers=headers).json()

def test_new_timeline_is_hidden_publicly_until_it_has_chapters(client, admin_headers): ...
    # add → "timeline" not in public_types; PUT one chapter → present
def test_timeline_rejects_too_many_chapters(client, admin_headers): ...  # 9 chapters → 422/400
def test_timeline_rejects_chapter_without_photo(client, admin_headers): ...
def test_timeline_rejects_photo_from_outside_our_bucket(client, admin_headers): ...
def test_timeline_rejects_long_chapter_body(client, admin_headers): ...  # 401 chars
```
(Check the status code `test_invalid_section_content_is_rejected_with_a_readable_message` expects and use the same.)

- [ ] **Step 2:** `uv run pytest tests/modules/content/test_timeline.py` → FAIL (unknown section type).
- [ ] **Step 3: Implement.**
  - `enums.py`: `TIMELINE = "timeline"` under custom sections; add to `CUSTOM_SECTIONS`.
  - `constants.py` (custom sections block): `TIMELINE_MAX_CHAPTERS = 8`, `TIMELINE_CHAPTER_BODY_MAX_LENGTH = 400`.
  - `schemas.py`: after `GalleryContent`:
    ```python
    class TimelineChapter(StrictModel):
        kicker: Label
        title: Heading
        body: Annotated[str, _text(TIMELINE_CHAPTER_BODY_MAX_LENGTH)]
        image: Image


    class TimelineContent(StrictModel):
        heading: Heading
        intro: Annotated[str, _text(SHORT_TEXT_MAX_LENGTH, required=False)] = ""
        # Empty while being set up; an empty timeline isn't shown publicly (like galleries).
        chapters: Annotated[list[TimelineChapter], Field(max_length=TIMELINE_MAX_CHAPTERS)]
    ```
    Register `SectionType.TIMELINE: TimelineContent` in `CONTENT_MODELS`.
  - `service.py`:
    ```python
    # Sections whose list starts empty while the owner sets them up; empty ones stay off the page.
    LIST_FIELD_REQUIRED_PUBLICLY = {SectionType.GALLERY: "images", SectionType.TIMELINE: "chapters"}

    def _has_public_content(section: PageSection) -> bool:
        field = LIST_FIELD_REQUIRED_PUBLICLY.get(section.section_type)
        return field is None or bool(section.content.get(field))
    ```
    `add_section` error text: `"Only story, gallery, timeline, text and call-to-action sections can be added"`.
  - `defaults.py` `NEW_SECTION_CONTENT[SectionType.TIMELINE] = {"heading": "How the wagon came back", "intro": "", "chapters": []}`.
  - Migration (revises `0cd5e1df31d6`): `upgrade` runs `op.execute("ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'timeline'")`; `downgrade` runs `op.execute("DELETE FROM page_sections WHERE section_type::text = 'timeline'")` with the comment that Postgres can't drop enum values.
- [ ] **Step 4:** `uv run pytest tests/modules/content` → PASS.

### Task 2: Story copy and photos

**Files:**
- Modify: `backend/app/modules/content/defaults.py` (settings + built-in copy per spec "Copy deck")
- Create: `backend/app/modules/content/story.py`, `backend/app/modules/content/story_photos/{bare-frame,pinstriping,cabinets,first-roll,headed-south,evening-event}.jpg`
- Test: `backend/tests/modules/content/test_story_content.py`

**Interfaces:**
- Produces (in `story.py`): `STORY_PHOTOS_DIR: Path`, `StoryPhoto` (frozen dataclass `file_name: str`, `alt: str`), `story_sections(photo_urls: Mapping[str, str]) -> list[tuple[SectionType, dict[str, Any]]]` returning Story, Timeline, CTA content in that order, `STORY_PHOTOS: tuple[StoryPhoto, ...]`, `STORY_SETTINGS: dict[str, str]` (tagline, phone_display, phone_e164, email).

- [ ] **Step 1: Copy photos.** From `frontend/src/assets/`: `337a10c4…` → `bare-frame.jpg`, `975171b3…` → `pinstriping.jpg`, `800cb994…` → `cabinets.jpg`, `a87b7270…` → `first-roll.jpg`, `eb2c44d1…` → `headed-south.jpg`, `1b96a4ab…` → `evening-event.jpg`.
- [ ] **Step 2: Failing test** `test_story_content.py`:
```python
def fake_urls() -> dict[str, str]:
    return {photo.file_name: f"{public_url_prefix(TEST_SUPABASE_URL)}images/{photo.file_name}" for photo in STORY_PHOTOS}

def test_every_story_photo_file_exists() -> None:
    for photo in STORY_PHOTOS:
        assert (STORY_PHOTOS_DIR / photo.file_name).is_file()

def test_story_sections_validate_against_their_schemas(monkeypatch) -> None:
    monkeypatch.setattr("app.core.config.settings.supabase_url", TEST_SUPABASE_URL)
    sections = story_sections(fake_urls())
    assert [kind for kind, _ in sections] == [SectionType.STORY, SectionType.TIMELINE, SectionType.CTA]
    for kind, content in sections:
        validate_content(kind, content)  # raises on any limit breach

def test_default_sections_still_validate() -> None:
    for kind, content in DEFAULT_SECTIONS:
        validate_content(kind, content)
```
- [ ] **Step 3: Implement** `story.py` with the spec's exact Story body, Timeline heading/intro/5 chapters, CTA, and alt texts; `defaults.py` built-in copy (Hero, Event types, Flavors → "Fresh from the wagon" with Popcorn/butter, Roasted peanuts/caramel, Whirly lollipops/cherry, Packages "Pick your package", How it works step 3 + CTA label, FAQ two new items first-and-after + replaced allergy answer, Booking "Book the wagon") and `DEFAULT_SETTINGS` phone/email/tagline. Update the module docstring: only Instagram is still a placeholder.
- [ ] **Step 4:** `uv run pytest tests/modules/content` → PASS (existing tests read values from `DEFAULT_*`, so they follow the new copy).

### Task 3: `apply-story` command

**Files:**
- Modify: `backend/app/modules/media/__init__.py` (export `upload_image`, `get_storage`), `backend/app/modules/content/commands.py`, `backend/app/cli.py`
- Create: `backend/app/modules/content/apply_story.py`
- Test: `backend/tests/modules/content/test_apply_story.py`

**Interfaces:**
- Consumes: `story_sections`, `STORY_PHOTOS`, `STORY_PHOTOS_DIR`, `STORY_SETTINGS` (Task 2); `validate_content`, `list_sections`, `get_settings` from `service.py`.
- Produces: `apply_story(db: Session, upload: Callable[[bytes], str]) -> int` (number of sections on the page afterwards); raises `BusinessRuleError(STORY_ALREADY_APPLIED)` if any timeline section exists.

- [ ] **Step 1: Failing tests**:
```python
class FakeUploader:
    def __init__(self, fail_after: int | None = None) -> None:
        self.uploaded = 0; self.fail_after = fail_after
    def __call__(self, data: bytes) -> str:
        if self.fail_after is not None and self.uploaded >= self.fail_after:
            raise RuntimeError("Storage is down")
        self.uploaded += 1
        return f"{public_url_prefix(TEST_SUPABASE_URL)}images/{self.uploaded}.jpg"

def test_apply_story_updates_settings_and_orders_the_arc(db) -> None:
    apply_story(db, FakeUploader())
    assert get_settings(db).phone_display == "(404) 682-6707"
    assert [s.section_type for s in list_sections(db)] == ARC_ORDER  # hero, story, timeline, event_types, flavors, packages_menu, how_it_works, faq, cta, booking

def test_apply_story_overwrites_built_in_copy(db) -> None:  # edit hero headline first, then apply → default headline back

def test_apply_story_keeps_existing_custom_sections_before_booking(db) -> None:
    add_section(db, SectionType.TEXT); apply_story(db, FakeUploader())
    types = [s.section_type for s in list_sections(db)]
    assert types[-2:] == [SectionType.TEXT, SectionType.BOOKING]

def test_apply_story_puts_uploaded_urls_in_content(db) -> None:  # timeline chapters' image urls are the fake ones

def test_apply_story_refuses_a_second_run(db) -> None:
    apply_story(db, FakeUploader())
    with pytest.raises(BusinessRuleError): apply_story(db, FakeUploader())

def test_failed_upload_changes_nothing(db) -> None:
    before = get_settings(db).phone_display
    with pytest.raises(RuntimeError): apply_story(db, FakeUploader(fail_after=2))
    assert get_settings(db).phone_display == before
    assert SectionType.TIMELINE not in {s.section_type for s in list_sections(db)}
```
(Seed via `seed_defaults(db)` in an autouse fixture that also monkeypatches `supabase_url`, like `test_content.py`. Make the "before" phone differ by setting it to the old placeholder first.)
- [ ] **Step 2:** run → FAIL (module missing).
- [ ] **Step 3: Implement** `apply_story.py`:
```python
STORY_ALREADY_APPLIED = "The story is already on the page"
# Built-in and story sections in reading order; anything else goes just before booking.
ARC_ORDER = (HERO, STORY, TIMELINE, EVENT_TYPES, FLAVORS, PACKAGES_MENU, HOW_IT_WORKS, FAQ, CTA)

def _upload_photos(upload) -> dict[str, str]:
    return {p.file_name: upload((STORY_PHOTOS_DIR / p.file_name).read_bytes()) for p in STORY_PHOTOS}

def apply_story(db, upload) -> int:
    sections = list(list_sections(db))
    if any(s.section_type is SectionType.TIMELINE for s in sections):
        raise BusinessRuleError(STORY_ALREADY_APPLIED)
    photo_urls = _upload_photos(upload)          # before any write
    _update_settings(db)                          # STORY_SETTINGS onto get_settings(db)
    _rewrite_built_ins(sections)                  # content = validate_content(type, DEFAULT content)
    added = [_new_section(kind, content) for kind, content in story_sections(photo_urls)]
    db.add_all(added)
    _set_positions(sections + added)              # ARC_ORDER first (story ones by type), other customs in old order, booking last
    db.commit()
    return len(sections) + len(added)
```
  Keep each helper ≤ 40 lines. `media/__init__.py`: also export `upload_image` and `get_storage`. `commands.py`:
```python
def apply_story_command() -> None:
    """Upload the story photos and rewrite the page as the wagon's story (run once)."""
    storage = get_storage()
    with SessionLocal() as db:
        count = apply_story(db, lambda data: upload_image(storage, data))
    logger.info("Story applied; the page now has %d section(s)", count)
```
  `cli.py`: subcommand `apply-story`, help "rewrite the page as the wagon's story (overwrites built-in section text)", docstring line added.
- [ ] **Step 4:** full backend check: `uv run ruff check . && uv run ruff format --check . && uv run pytest` → PASS.

### Task 4: Frontend entity (`entities/site`)

**Files:** `src/entities/site/model/types.ts`, `config/sections.ts`, `config/limits.ts`, `lib/summary.ts`, `lib/preview.ts`, `index.ts`

- [ ] **Step 1:** `SECTION_TYPES.timeline = 'timeline'`, add to `CUSTOM_SECTION_TYPES`; DTO:
```ts
[SECTION_TYPES.timeline]: {
  heading: string
  intro: string
  chapters: { kicker: string; title: string; body: string; image: ImageDto }[]
}
```
  `export type TimelineContent = SectionContentMap[typeof SECTION_TYPES.timeline]` and export it from `index.ts`.
- [ ] **Step 2:** `SECTION_META[timeline] = { label: 'Restoration timeline', anchorId: null, navLabel: null }`; `CUSTOM_SECTION_OPTIONS` entry after gallery: `{ type: SECTION_TYPES.timeline, description: 'Photo chapters that tell how something came to be.' }`.
- [ ] **Step 3:** limits `timelineMaxChapters: 8`, `timelineChapterBody: 400`; summary case `` `${heading}, ${count(chapters, 'chapter', 'chapters')}` ``; preview `hasPublicContent` also hides a timeline with zero chapters.
- [ ] **Step 4:** `npm run build` will fail until Tasks 5–6 register the type in `SECTION_FORMS` / `SECTION_WIDGETS` (exhaustive maps). That is expected; continue.

### Task 5: Timeline editor form

**Files:** Create `src/features/edit-section/ui/TimelineForm.tsx`; modify `model/schemas.ts`, `ui/SectionEditor.tsx`

- [ ] **Step 1:** `schemas.ts`:
```ts
// Chapter rows hold an image that may not be uploaded yet.
export const timelineSchema = z.object({
  heading: requiredText(LIMITS.heading, 'Enter a heading'),
  intro: optionalText(LIMITS.shortText),
  chapters: listSchema(
    z.object({
      kicker: requiredText(LIMITS.label, 'Enter a short label, like "Chapter 1"'),
      title: requiredText(LIMITS.heading, 'Enter a chapter title'),
      body: requiredText(LIMITS.timelineChapterBody, 'Write a sentence or two'),
      image: imageSchema.nullable().refine((image) => Boolean(image), 'Upload a photo or remove this chapter'),
    }),
    { min: 0, max: LIMITS.timelineMaxChapters, noun: 'chapter' },
  ),
})
export type TimelineFormValues = z.infer<typeof timelineSchema>
export const timelineForm = {
  toValues: (content: TimelineContent): TimelineFormValues => content,
  // Chapters without an upload yet are left out of the draft (saving is blocked until they're filled).
  toContent: (values: TimelineFormValues): TimelineContent => ({
    ...values,
    chapters: values.chapters.flatMap(({ image, ...chapter }) => (image ? [{ ...chapter, image }] : [])),
  }),
}
```
- [ ] **Step 2:** `TimelineForm.tsx`, structured like `GalleryForm`: heading, intro, a notice when there are no chapters ("The timeline stays off the website until it has at least one chapter."), and a `ListEditor` (legend "Chapters", noun "chapter") where each row has an `ImageUploadField`, plus kicker, title and body `TextField`s (body `rows={CHAPTER_BODY_ROWS}` = 4). Append `{ kicker: \`Chapter ${n}\`, title: '', body: '', image: null }`.
- [ ] **Step 3:** register `[SECTION_TYPES.timeline]: TimelineForm` in `SECTION_FORMS`.

### Task 6: Timeline landing widget

**Files:** Create `src/widgets/landing-page/ui/sections/Timeline.tsx`; modify `LandingPage.tsx`, `src/app/styles/index.css`

- [ ] **Step 1:** CSS utility below `reveal-draw`:
```css
/* The same draw, top to bottom: the timeline's pinstripe. */
@keyframes reveal-draw-down {
  from { scale: 1 0; }
  to { scale: none; }
}

@utility reveal-draw-down {
  --reveal-keyframes: reveal-draw-down;
  transform-origin: top;
}
```
- [ ] **Step 2:** `Timeline.tsx` (props `anchorId`, `content: TimelineContent`):
  - `<section id className="section-anchor relative overflow-hidden bg-ink py-14 text-kernel md:py-28">`, a centered `h2` (`font-display text-5xl text-butter md:text-6xl`) and an optional intro.
  - `<ol className="relative mx-auto mt-14 max-w-6xl">` with an `aria-hidden` pinstripe line: `absolute top-0 bottom-0 left-5 w-1 rounded-full bg-butter reveal reveal-draw-down lg:left-1/2 lg:-translate-x-1/2`.
  - Each `<li>` is a two-column grid on `lg` (`lg:grid-cols-2 lg:gap-16`), padded on the left on mobile (`pl-14 lg:pl-0`). Even-index chapters put the photo on the left and odd-index ones on the right, using `lg:order-*`.
  - A stamp dot: `aria-hidden` `absolute size-5 rounded-full border-4 border-ink bg-butter reveal` with `--reveal-keyframes: reveal-pop` via the existing `animate-stamp` pattern. Check how `HowItWorks`/`CallToAction` apply pop and copy that.
  - The photo: `<figure className="reveal reveal-pin">`, and an `<img>` with `aspect-[4/3] w-full rounded-2xl border-4 border-butter object-cover shadow-sign-lg` and `loading="lazy"`.
  - Text: the kicker as `text-sm font-bold tracking-widest text-butter uppercase`, the title as `h3 font-display text-3xl md:text-4xl`, and the body as `text-lg leading-relaxed text-kernel/85`.
  - Keep it under ~120 lines; extract a `TimelineChapterItem` component in the same file if needed.
- [ ] **Step 3:** register `[SECTION_TYPES.timeline]: (content, { anchorId }) => <Timeline anchorId={anchorId} content={content} />` in `SECTION_WIDGETS`.
- [ ] **Step 4:** `npm run lint && npm run build` → PASS. If `shadow-sign-lg` or any of the tokens above don't exist, use the ones `Story.tsx` uses.

### Task 7: Clean up and verify

- [ ] **Step 1:** Delete `frontend/src/assets/`. The used photos now live in the backend, and the rest (including the brochure scans) aren't published.
- [ ] **Step 2:** Run the full definition of done for both apps.
- [ ] **Step 3:** Apply the migration and story to a **local or test** database only, never the live site without the user, then look at the page in the browser at 1280px and 390px wide. Check the timeline layout, the pinstripe and the stamps, reduced motion, the admin timeline editor and the preview. If no local DB or storage is available, report that the visual check was skipped.
- [ ] **Step 4:** Report the results. Tell the user to run `uv run alembic upgrade head` and `uv run python -m app.cli apply-story` per environment, and flag the Instagram placeholder.
