# User Feedback Popup

## What will be added
- A lightweight UPSC Quest feedback bottom sheet on phones and centered modal on larger screens, using the existing clay styling, buttons, icons, and accessible dialog foundation.
- Multi-select feedback cards, conditional “Something Else” input, optional additional comments, submission loading/error states, and a thank-you confirmation.
- “Maybe later” and close controls that remember dismissal in the browser so the prompt appears only once.

## Trigger behavior
- Open only after a learner completes Daily Practice, a current-affairs quiz, or a mock test.
- Never open during an active test and never appear immediately on site entry.
- Use the existing completion flows to emit one shared feedback-ready event, avoiding duplicate popup logic.

## Anonymous storage
- Add one feedback table in the existing backend with only selected options, optional custom text, optional comments, timestamp, and a random browser identifier.
- Permit anonymous submissions while blocking public reads and updates; validate lengths and allowed choices in the database.
- Submit through the existing browser connection with no login requirement and no personal details.

## Verification
- Check submission and one-time dismissal behavior.
- Test completed-quiz triggering, scrolling, touch targets, and overflow at 320px, 375px, 390px, 430px, tablet, and desktop widths.
- Confirm existing Practice and Mock Test flows remain operational.

## Technical details
- Reuse the existing Sheet/Dialog and ClayButton components.
- Add a small shared feedback event helper and one root-level popup component.
- Extend generated database typings only for the new feedback table; leave generated connection files unchanged.
