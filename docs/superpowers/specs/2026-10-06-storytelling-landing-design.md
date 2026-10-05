# Storytelling landing page: design

Date: 2026-10-06
Status: draft, awaiting review

## Goal

Turn the landing page from a generic "popcorn cart rental" pitch into the real story of The
Red Popcorn Wagon: a founder's childhood memory, a hand-restored 1907 Cretors Model D, and
the wagon now serving events in metro Atlanta. Visitors should finish the story wanting to
book.

### Decisions already made (with the user)

- **Scope:** rewrite the copy, and add one new purpose-built section type, a scroll
  **Timeline** of restoration chapters. Everything stays editable in the CMS.
- **Facts:** the printed brochure is the source of truth: phone 404-682-6707,
  info@theredpopcornwagon.com, products are popcorn, roasted peanuts and whirly lollipops.
  Services add HOA events and a portable movie screen package. The invented six-flavor list
  and the coconut-oil and cheddar claims are removed.
- **Rollout:** a one-time CLI command (`apply-story`) uploads the photos to media storage
  and rewrites the live content. It runs once per environment.
- **Voice:** the founder in the first person ("I"), like the brochure. No names of people
  or places, and no restoration dates.

### Assumptions (correct me if wrong)

- The restored wagon traveled to Atlanta after the restoration (photos: snowy northern
  shop, loading into a semi, then serving at a Georgia shopping center). The copy says
  "her new home in Atlanta" and names no origin.
- Existing facts the brochure doesn't contradict stay as they are: delivery inside I‑285,
  45-minute early arrival, setup and cleanup included, the 6×6 ft spot and outlet needs.
- The Instagram handle is still a placeholder; it's left unchanged and flagged to the owner.

## Narrative arc (page order after `apply-story`)

| # | Section (type) | Role in the story |
|---|---|---|
| 1 | Hero (built-in) | The hook: a 1907 wagon, still popping |
| 2 | Story (custom) | The memory: why the founder did this |
| 3 | **Timeline (new custom)** | The restoration in five chapters |
| 4 | Event types (built-in) | Where the wagon goes now |
| 5 | Flavors (built-in), retitled | What's served from the wagon |
| 6 | Packages menu (built-in) | Choose a package |
| 7 | How it works (built-in) | How booking goes |
| 8 | FAQ (built-in) | Remaining doubts |
| 9 | CTA (custom) | The emotional close: "Step back into yesteryear" |
| 10 | Booking (built-in) | The form |

Any custom sections that already exist keep their relative order and are placed just
before Booking.

## Copy deck

All lengths are within the current schema limits (heading ≤ 60, label ≤ 40, short text
≤ 300, hero description ≤ 400, story body ≤ 2000).

### Site settings (only these fields change)

- `tagline`: "A restored 1907 popcorn wagon for events in metro Atlanta"
- `phone_display`: "(404) 682-6707", `phone_e164`: "+14046826707"
- `email`: "info@theredpopcornwagon.com"

### Hero

- headline: "A 1907 popcorn\nwagon, still\npopping."
- description: "The Red Popcorn Wagon is a hand-restored 1907 Cretors Model D. We roll it
  to your event anywhere in metro Atlanta and serve hot, fresh popcorn and warm roasted
  peanuts straight from the wagon."
- primary CTA: "Book the wagon"; secondary CTA: "See packages"
- highlights: "Hand-restored 1907 Cretors", "Popped fresh in front of guests",
  "Setup and cleanup included"

### Story: "The really good popcorn" (image right: event photo)

> When I was a kid, my parents took us to the park downtown every week to get "the really
> good popcorn." Those trips left me with some of my fondest memories of time with my
> family, and nothing brings them back like the smell of fresh popcorn drifting through the
> air.
>
> When I retired, I realized there was no better way to share that feeling with today's
> world than to bring those same classic flavors to others. So I found a 1907 Cretors
> Model D popcorn wagon that needed a lot of love, and brought her back.
>
> Today she rolls up to parties, neighborhood events and office gatherings across metro
> Atlanta, popping hot, fresh popcorn and roasting warm peanuts the way it was done more
> than a century ago. Come take a step back in time with us.

Image alt: "The Red Popcorn Wagon lit up at an evening event, with the owner in a striped
vest and costumed characters."

### Timeline: "From bare frame to Atlanta"

intro: "Every panel, pinstripe and pane of glass went back on by hand. Here's how she came
back to life."

| Kicker | Title | Body | Photo |
|---|---|---|---|
| Chapter 1 | Down to the bones | She arrived as a bare steel frame with a rusted belly and not one window. Before anything could pop, every rivet and brace had to be checked, straightened and made road-worthy again. | Bare frame in the workshop |
| Chapter 2 | Wagon red, line by line | Coat after coat of deep wagon red went on. Then came the gold pinstripes, painted freehand one panel at a time, just as they were in 1907. | Hand-pinstriping the side panels |
| Chapter 3 | Oak, glass and chrome | Oak-framed cabinets, glass panes and polished hoods for the peanut roaster went back in, along with the old signs promising buttered corn and pure food. | Cabinets and "Buttered Corn · Pure Food" signs |
| Chapter 4 | The first roll | On a bright, snowy morning she rolled out of the shop finished: yellow spoked wheels, a striped awning and a sign promising fresh roasted peanuts. | Finished wagon on the driveway |
| Chapter 5 | Headed south | Then up the ramps and into a trailer for the long trip to her new home in Atlanta, where she's been popping at parties ever since. | Wagon rolling into the trailer |

Each photo gets a literal alt text describing it (written in the content file).

### Event types

"Special events", "Corporate events", "HOA & neighborhood events", "Backyard movie nights",
"Weddings", "Birthday parties", "School fairs", "Grand openings"

### Flavors, retitled "Fresh from the wagon"

- description: "Hot popcorn, peanuts roasted right in the wagon, and a whirly lollipop for
  the road. Old-fashioned treats, served the way the park wagon served them."
- items: Popcorn (butter), Roasted peanuts (caramel), Whirly lollipops (cherry)

The hero cart's flavor picker reads these items, so it becomes a product picker on its own.

### Packages menu

- heading: "Pick your package"
- description: "Every package includes delivery inside I‑285, setup, bags for your guests
  and cleanup. Want something custom? Give us a call."

### How it works

Same three steps. Step 3 body: "We arrive 45 minutes early, roll the wagon into place, pop
fresh all event long and clean up after." CTA label: "Book the wagon".

### FAQ

- **New, first:** "Is the wagon really from 1907?" / "Yes. She's a 1907 Cretors Model D,
  restored by hand panel by panel. Guests love watching the popcorn kettle work through the
  glass."
- **New:** "Can you bring a movie screen?" / "Yes. Ask about our portable movie screen and
  popcorn wagon package for backyard and neighborhood movie nights. Call us for pricing."
- **Replaced** allergy answer: "We roast peanuts in the wagon and pop with butter, so the
  wagon isn't nut-free or dairy-free. Tell us about any allergies in your booking notes and
  we'll talk it through."
- The travel, power, outdoor, lead-time and payment answers stay as they are.

### CTA: "Step back into yesteryear"

- body: "Fresh popcorn, warm roasted peanuts and a 1907 wagon your guests will talk about
  long after the party."
- button: "Book the wagon", target: book

### Booking

heading: "Book the wagon". The rest is unchanged.

## Technical design

### Backend: new `timeline` section type (content module)

- `enums.py`: add `SectionType.TIMELINE = "timeline"` to `CUSTOM_SECTIONS`.
- **Migration:** `ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'timeline'`. The
  downgrade deletes timeline rows, so older code never meets one, and leaves the enum
  value in place (Postgres can't drop enum values). No new table, so no RLS change.
- **Deploy order:** deploy the API and frontend first, then migrate, then run
  `apply-story`. The older API can't load a `timeline` row.
- `constants.py`: `TIMELINE_MAX_CHAPTERS = 8`, `TIMELINE_CHAPTER_BODY_MAX_LENGTH = 400`.
  The kicker uses the existing `Label` type (40 characters).
- `schemas.py`:
  ```python
  class TimelineChapter(StrictModel):
      kicker: Label
      title: Heading
      body: Annotated[str, _text(TIMELINE_CHAPTER_BODY_MAX_LENGTH)]
      image: Image            # same hosted-image validation as Story/Gallery

  class TimelineContent(StrictModel):
      heading: Heading
      intro: Annotated[str, _text(SHORT_TEXT_MAX_LENGTH, required=False)] = ""
      # Empty while being set up; an empty timeline isn't shown publicly (like galleries).
      chapters: Annotated[list[TimelineChapter], Field(max_length=TIMELINE_MAX_CHAPTERS)]
  ```
  Registered in `CONTENT_MODELS`.
- `service._has_public_content`: also hides a timeline with no chapters.
- `defaults.NEW_SECTION_CONTENT[TIMELINE]`: heading "How the wagon came back", empty intro,
  no chapters.
- `defaults.py`: built-in copy and settings are updated to the copy deck above, so a fresh
  site seeds the new story text too.

### Backend: `apply-story` command

- `content/story.py` holds the Story, Timeline and CTA content, plus a mapping from photo
  file to alt text. It's kept out of `defaults.py` because of the 300-line limit.
- The photos used (6 files, about 2 MB) move to `backend/app/modules/content/story_photos/`
  with descriptive names (`bare-frame.jpg`, `pinstriping.jpg`, `cabinets.jpg`,
  `first-roll.jpg`, `headed-south.jpg`, `evening-event.jpg`).
- `service.apply_story(db, upload: Callable[[bytes], str]) -> ApplyStoryResult`:
  1. **Guard:** if a timeline section already exists, raise `BusinessRuleError("The story
     is already applied")`, so running it twice changes nothing.
  2. Upload each photo through `upload` and collect the public URLs. Uploads happen before
     any DB write, so a failed upload leaves the content untouched.
  3. In one transaction: update the settings fields, overwrite the content of every
     built-in section from `DEFAULT_SECTIONS`, add the Story, Timeline and CTA sections
     (validated through `validate_content`), then set every position in the arc order.
- The media module exports `upload_image` and `get_storage` from its `__init__.py`, so
  content doesn't import media internals.
- `commands.apply_story()` wires `get_storage()` into `upload_image`, and `cli.py` gets an
  `apply-story` subcommand plus a docstring line.
- **Warning in the command help:** it overwrites the text of the built-in sections, so any
  edits the owner already made to those are replaced.

### Frontend

- `entities/site`: add `timeline` to `SECTION_TYPES` and the custom list, plus its DTO and
  camelized types, `TimelineContent`, `SECTION_META` ("Restoration timeline"), a
  `CUSTOM_SECTION_OPTIONS` entry ("Photo chapters that tell how something came to be"),
  `summary.ts` and the `preview.ts` empty-section rule.
- `features/edit-section`: `timelineSchema` and `timelineForm` in `model/schemas.ts`, plus
  `ui/TimelineForm.tsx` (heading, intro, sortable chapter rows with kicker, title, body
  and `ImageUploadField`), reusing `SortableItems` the same way the gallery form does.
  Registered in `SectionEditor`.
- `widgets/landing-page/ui/sections/Timeline.tsx`, registered in `LandingPage`'s
  `SECTION_WIDGETS`:
  - A navy (`bg-ink`) band with kernel-colored text, set apart from the cream Story above it.
  - A vertical **butter-gold pinstripe** down the center (left edge on mobile) that draws
    itself as the section scrolls in, using a new `reveal-draw-down` utility (the
    `reveal-draw` keyframes with `transform-origin: top` and `scale: 1 0`).
  - Each chapter is an `<ol>` item: the photo alternates sides on `lg` screens and is
    framed with a butter border and `reveal-pin`, the kicker is a small butter label, the
    title is in the display font, and a kernel "stamp" dot on the line uses
    `animate-stamp` / `reveal-pop`.
  - Semantic markup: `<section>` with `<h2>`, `<ol>` of `<li><figure>` with alt text.
    Reduced motion gets the static layout, which the existing utilities already handle.
- `frontend/src/assets/` is removed. The used photos live in the backend, and the
  brochure scans and unused photos aren't published.

### Testing

- Backend (`tests/modules/content/`):
  - `TimelineContent`: a valid payload passes; more than 8 chapters, a missing image, an
    image URL outside our bucket, or a body over the limit are each rejected.
  - Adding a timeline section works, and an empty timeline is left out of the public site.
  - `apply_story` with a fake uploader: the settings are updated, the built-in content
    matches the defaults, the sections are in arc order with existing custom sections
    before Booking, the uploaded URLs end up in the content, and a second run raises
    without changing anything.
  - Migration: it applies cleanly on the test database (covered by the existing setup).
- Frontend: `npm run lint && npm run build`, then a visual check of the landing page and
  the timeline editor at desktop and phone widths (Edge + CDP, as set up before).
- Definition of done: the backend `ruff check`, `ruff format --check` and `pytest`
  commands all pass, along with the frontend lint and build.

## Out of scope

- Package data, prices and a movie-screen package record. Packages live in their own
  module; the owner can add one in the admin panel.
- Hero illustration, theme and fonts.
- A before/after slider or a horizontal scroll-jacked timeline (both considered and
  rejected).
