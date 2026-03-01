# Rejection Loop

Use this loop when the user rejects the freeze proposal in Process step 5.

## 1. Classify Rejection Reason

- `requirements mismatch`
- `design mismatch`
- `insufficient evidence`
- `scope or priority change`

## 2. Roll Back to the Correct Phase

- `requirements mismatch` -> return to Process step 2
- `insufficient evidence` -> return to Process step 3
- `design mismatch` -> return to Process step 4
- `scope or priority change` -> return to Process step 1 or step 2

## 3. Record Change Log

For each rejection cycle, append to ticket change log:

- Iteration number
- Rejected area
- Rejection reason
- Corrective action
- New freeze proposal summary

## 4. Re-run Freeze Gate

- Re-present validated requirements and design.
- Ask for explicit approval again.
- Repeat loop until approved.

## 5. Completion Rule

Do not move to ticket finalization unless freeze is explicitly approved.
