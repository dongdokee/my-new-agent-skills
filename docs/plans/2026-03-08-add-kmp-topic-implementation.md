# Add Kotlin Multiplatform Topic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new "Kotlin Multiplatform" topic (ID: "20") to the app's local data seeds and associate it with an existing news item.

**Architecture:** Modifying static demo seed data (`topics.json` and `news.json`). The data layer will automatically ingest these changes on startup.

**Tech Stack:** JSON, Local Database (Room)

---

### Task 1: Add new Topic to topics.json

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/topics.json`

**Step 1: Modify topics.json**
Append the new Kotlin Multiplatform topic to the JSON array in `nowinandroid/core/network/src/main/assets/topics.json`.
```json
  ,
  {
    "id": "20",
    "name": "Kotlin Multiplatform",
    "shortDescription": "Including Compose Multiplatform",
    "longDescription": "The latest news and guidance for building cross-platform applications with Kotlin Multiplatform and Compose Multiplatform.",
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
    "url": ""
  }
]
```

**Step 2: Verify JSON syntax**
Run: `jq . nowinandroid/core/network/src/main/assets/topics.json > /dev/null`
Expected: No output (which means valid JSON).

**Step 3: Commit**
```bash
git add nowinandroid/core/network/src/main/assets/topics.json
git commit -m "feat: add Kotlin Multiplatform topic to demo data"
```

### Task 2: Associate News Item with new Topic

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/news.json`

**Step 1: Modify news.json**
Find the first news item (ID "1", titled "Android Dev Summit..."). Update its `topics` array to include `"20"`.
```json
    "topics": [
      "1",
      "20"
    ],
```

**Step 2: Verify JSON syntax**
Run: `jq . nowinandroid/core/network/src/main/assets/news.json > /dev/null`
Expected: No output (which means valid JSON).

**Step 3: Commit**
```bash
git add nowinandroid/core/network/src/main/assets/news.json
git commit -m "test: associate news item 1 with Kotlin Multiplatform topic"
```
