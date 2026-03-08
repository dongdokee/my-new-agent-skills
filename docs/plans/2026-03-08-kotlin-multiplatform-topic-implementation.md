# Kotlin Multiplatform Topic Addition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 'Kotlin Multiplatform' as a followable topic in the Now in Android demo data.

**Architecture:** Append a new `NetworkTopic` object to the `topics.json` asset file which is consumed by `DemoNiaNetworkDataSource`.

**Tech Stack:** JSON, Android (Kotlin), Gradle

---

### Task 1: Add Kotlin Multiplatform Topic to assets

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/topics.json`

**Step 1: Append the new topic object**

Add the following JSON object to the end of the array in `topics.json`, ensuring proper comma placement for the preceding element.

```json
  {
    "id": "20",
    "name": "Kotlin Multiplatform",
    "shortDescription": "Kotlin code sharing",
    "longDescription": "Share code between Android, iOS, Web, and Desktop using Kotlin Multiplatform.",
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
    "url": ""
  }
```

**Step 2: Verify JSON syntax**

Run: `python3 -m json.tool nowinandroid/core/network/src/main/assets/topics.json > /dev/null`
Expected: Success (No output/No error)

**Step 3: Commit**

```bash
git add nowinandroid/core/network/src/main/assets/topics.json
git commit -m "feat: add Kotlin Multiplatform topic to demo data"
```

### Task 2: Verify topic loading in Unit Test

**Files:**
- Test: `nowinandroid/core/network/src/test/kotlin/com/google/samples/apps/nowinandroid/core/network/demo/DemoNiaNetworkDataSourceTest.kt`

**Step 1: Update or add test case to verify all topics (including the new one) are loaded**

Check if `DemoNiaNetworkDataSourceTest` already verifies the size or content of topics.

Run: `./gradlew :core:network:test`
Expected: PASS

**Step 2: Commit**

```bash
git commit -m "test: verify demo network data source loads new topic"
```
