# Add Kotlin Multiplatform Topic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new "Kotlin Multiplatform" topic to the Now in Android app's demo data and testing suite.

**Architecture:** Update the static JSON asset used by the demo flavor and the corresponding test data provider in the testing module to ensure consistency across the app.

**Tech Stack:** Kotlin, JSON, Android (Now in Android codebase)

---

### Task 1: Update Demo Assets

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/topics.json`

**Step 1: Append the new topic to topics.json**

```json
  {
    "id": "20",
    "name": "Kotlin Multiplatform",
    "shortDescription": "Share logic across Android, iOS, and Desktop",
    "longDescription": "Learn how to use Kotlin Multiplatform (KMP) to share business logic, networking, and data storage across different platforms including Android, iOS, and desktop applications.",
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Architecture.svg?alt=media&token=e69ed228-fa91-49ae-9017-c8b7331f4269",
    "url": ""
  }
```

**Step 2: Verify JSON format**

Run: `cat nowinandroid/core/network/src/main/assets/topics.json | tail -n 20`
Expected: The new topic should be the last entry before the closing bracket `]`.

**Step 3: Commit**

```bash
git add nowinandroid/core/network/src/main/assets/topics.json
git commit -m "feat: add Kotlin Multiplatform topic to demo assets"
```

---

### Task 2: Update Testing Data

**Files:**
- Modify: `nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt`

**Step 1: Add the new topic to topicsTestData list**

```kotlin
    Topic(
        id = "20",
        name = "Kotlin Multiplatform",
        shortDescription = "Share logic across Android, iOS, and Desktop",
        longDescription = "Learn how to use Kotlin Multiplatform (KMP) to share business logic, networking, and data storage across different platforms including Android, iOS, and desktop applications.",
        imageUrl = "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Architecture.svg?alt=media&token=e69ed228-fa91-49ae-9017-c8b7331f4269",
        url = "",
    ),
```

**Step 2: Verify the file content**

Run: `cat nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt`
Expected: The new topic is present in the `listOf(...)`.

**Step 3: Commit**

```bash
git add nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt
git commit -m "test: add Kotlin Multiplatform topic to test data"
```

---

### Task 3: Final Validation

**Files:**
- None

**Step 1: Verify data integrity with grep**

Run: `grep -r "Kotlin Multiplatform" nowinandroid/core/network/src/main/assets/topics.json nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt`
Expected: Both files should show a match.

**Step 2: Run related unit tests (Optional/If available)**

Run: `./gradlew :core:data:testDemoDebugUnitTest` (or similar command found in AGENTS.md)
Expected: Tests should pass, confirming that the data remains serializable and correctly handled.
