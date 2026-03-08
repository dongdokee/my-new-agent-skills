# Add Kotlin Multiplatform Topic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new "Kotlin Multiplatform" topic to the Now in Android app by updating core assets, news data, and test data.

**Architecture:** Update static JSON assets in the network module and Kotlin test data in the testing module.

**Tech Stack:** JSON, Kotlin, Android.

---

### Task 1: Update topics.json Asset

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/topics.json`

**Step 1: Add the new topic entry**
Append the following JSON object to the end of the array in `nowinandroid/core/network/src/main/assets/topics.json`.

```json
  {
    "id": "20",
    "name": "Kotlin Multiplatform",
    "shortDescription": "Share code between different platforms (e.g., Android, iOS, Web)",
    "longDescription": "Learn how to share your business logic, data layers, and more between Android, iOS, Web, and desktop apps using Kotlin Multiplatform.",
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
    "url": "https://kotlinlang.org/docs/multiplatform.html"
  }
```

**Step 2: Commit**

```bash
git add nowinandroid/core/network/src/main/assets/topics.json
git commit -m "feat(core/network): add Kotlin Multiplatform topic to topics.json"
```

---

### Task 2: Update news.json Asset

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/news.json`

**Step 1: Update news item ID 211**
Find the news item with `"id": "211"` and add `"20"` to its `"topics"` array.

```json
    "topics": [
      "10",
      "20"
    ],
```

**Step 2: Commit**

```bash
git add nowinandroid/core/network/src/main/assets/news.json
git commit -m "feat(core/network): tag news item 211 with Kotlin Multiplatform topic"
```

---

### Task 3: Update TopicsTestData.kt

**Files:**
- Modify: `nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt`

**Step 1: Add the new topic to test data**
Add the following `Topic` object to the `topicsTestData` list.

```kotlin
    Topic(
        id = "20",
        name = "Kotlin Multiplatform",
        shortDescription = "Share code between different platforms (e.g., Android, iOS, Web)",
        longDescription = "Learn how to share your business logic, data layers, and more between Android, iOS, Web, and desktop apps using Kotlin Multiplatform.",
        imageUrl = "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
        url = "https://kotlinlang.org/docs/multiplatform.html",
    ),
```

**Step 2: Commit**

```bash
git add nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt
git commit -m "test(core/testing): add Kotlin Multiplatform to TopicsTestData"
```

---

### Task 4: Verify Changes with Tests

**Files:**
- Test: `nowinandroid/core/data/src/test/kotlin/com/google/samples/apps/nowinandroid/core/data/repository/OfflineFirstTopicsRepositoryTest.kt`

**Step 1: Run relevant tests**
Run: `./gradlew :core:data:testDebugUnitTest --tests "com.google.samples.apps.nowinandroid.core.data.repository.OfflineFirstTopicsRepositoryTest"`

Expected: PASS
