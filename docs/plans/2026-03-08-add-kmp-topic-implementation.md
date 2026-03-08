# Add 'Kotlin Multiplatform' Topic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 'Kotlin Multiplatform' topic to Now in Android and connect a news resource.

**Architecture:** Update static JSON asset files used by the demo network data source.

**Tech Stack:** JSON, Android (Kotlin)

---

### Task 1: Add 'Kotlin Multiplatform' to topics.json

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/topics.json`

**Step 1: Append the new topic entry**

```json
  {
    "id": "20",
    "name": "Kotlin Multiplatform",
    "shortDescription": "Build for multiple platforms with Kotlin",
    "longDescription": "All the latest news on Kotlin Multiplatform (KMP) - allowing you to share code between Android, iOS, web, and desktop while keeping the benefits of native development.",
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
    "url": ""
  }
```

**Step 2: Verify JSON syntax**

Run: `python3 -m json.tool nowinandroid/core/network/src/main/assets/topics.json > /dev/null`
Expected: No error output.

**Step 3: Commit**

```bash
git add nowinandroid/core/network/src/main/assets/topics.json
git commit -m "feat: add Kotlin Multiplatform topic to assets"
```

---

### Task 2: Add KMP News Resource to news.json

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/news.json`

**Step 1: Prepend a new news item referencing topic ID 20**

```json
  {
    "id": "1000",
    "title": "Get started with Kotlin Multiplatform 🚀",
    "content": "Learn how to build your first multiplatform app with Kotlin and share code across platforms.",
    "url": "https://kotlinlang.org/docs/multiplatform.html",
    "headerImageUrl": "https://kotlinlang.org/docs/images/multiplatform-banner.png",
    "publishDate": "2026-03-08T00:00:00.000Z",
    "type": "Article 📝",
    "topics": [
      "20"
    ],
    "authors": [
      "1"
    ]
  },
```

**Step 2: Verify JSON syntax**

Run: `python3 -m json.tool nowinandroid/core/network/src/main/assets/news.json > /dev/null`
Expected: No error output.

**Step 3: Commit**

```bash
git add nowinandroid/core/network/src/main/assets/news.json
git commit -m "feat: add KMP news resource to assets"
```

---

### Task 3: Manual Verification (Instructions)

**Step 1: Build the app**

Run: `./gradlew :app:assembleDemoDebug`
Expected: Build successful.

**Step 2: Verify in UI (Conceptual)**
- Open the app.
- Go to 'Interests'.
- Verify 'Kotlin Multiplatform' is visible.
- Follow it and check 'For You' feed for the new article.
