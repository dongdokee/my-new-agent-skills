# Add 'Kotlin Multiplatform' Topic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new "Kotlin Multiplatform" topic and two associated news items to the Now in Android demo data.

**Architecture:** Update the static JSON assets used by the demo flavor of the application. The app dynamically loads these assets to populate its feeds and interests list.

**Tech Stack:** JSON

---

### Task 1: Add 'Kotlin Multiplatform' to `topics.json`

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/topics.json`

**Step 1: Write the failing test**
(Note: Since this is a data change, we'll verify it by checking if the JSON is valid and the topic is present.)
Run: `python3 -c "import json; topics = json.load(open('nowinandroid/core/network/src/main/assets/topics.json')); assert any(t['id'] == '20' for t in topics)"`
Expected: FAIL (AssertionError)

**Step 2: Add the new topic**
Append the following to the list in `nowinandroid/core/network/src/main/assets/topics.json`:
```json
  {
    "id": "20",
    "name": "Kotlin Multiplatform",
    "shortDescription": "",
    "longDescription": "The latest news on Kotlin Multiplatform (KMP), allowing you to share code across platforms like Android, iOS, web, and desktop.",
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
    "url": ""
  }
```

**Step 3: Run test to verify it passes**
Run: `python3 -c "import json; topics = json.load(open('nowinandroid/core/network/src/main/assets/topics.json')); assert any(t['id'] == '20' for t in topics)"`
Expected: PASS

**Step 4: Commit**
```bash
git add nowinandroid/core/network/src/main/assets/topics.json
git commit -m "feat: add 'Kotlin Multiplatform' topic to topics.json"
```

---

### Task 2: Add KMP News Items to `news.json`

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/news.json`

**Step 1: Write the failing test**
Run: `python3 -c "import json; news = json.load(open('nowinandroid/core/network/src/main/assets/news.json')); assert any(n['id'] == '312' for n in news) and any(n['id'] == '313' for n in news)"`
Expected: FAIL (AssertionError)

**Step 2: Add the new news items**
Append the following items before the closing bracket `]` in `nowinandroid/core/network/src/main/assets/news.json`:
```json
  {
    "id": "312",
    "title": "Kotlin Multiplatform is Stable and Ready for Production",
    "content": "Kotlin Multiplatform (KMP) has reached stability! It’s now ready for use in production across Android, iOS, and beyond. Learn how to get started with shared code between platforms.",
    "url": "https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-is-stable-and-ready-for-production/",
    "headerImageUrl": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKBGMJx7yKi1RuRF9Q1X-1GOgfCvJ7XVIhNZlsmYgeabTPyljHhEOr2F0iGkF2BM7jeE1HYnL75GXllESyWgpEZEQWm9xfKU5a8kDgrvS5-ZZN0eTq0QaTsCBOAFkJzGX9kBTZxfo_4p6O3DYkXVqsBMRynTq1Mw3EDq3hwEL5OcoCrSQ8rOvFrraK/w1200-h630-p-k-no-nu/Compose%20Blog%20social.jpg",
    "publishDate": "2023-11-01T23:00:00.000Z",
    "type": "Article 📚",
    "topics": [
      "20"
    ],
    "authors": []
  },
  {
    "id": "313",
    "title": "Compose Multiplatform for iOS is in Alpha",
    "content": "Jetpack Compose on iOS! Compose Multiplatform now supports iOS in Alpha, enabling you to share UI code between Android and iOS.",
    "url": "https://blog.jetbrains.com/kotlin/2023/05/compose-multiplatform-for-ios-is-in-alpha/",
    "headerImageUrl": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjn6__UOZ_lipXjY09TrHeXW4HjKodPUdFzmovYRn1tLwdYr8GVKjCN6wfgKpcby5rrJ6JFrUmZozT7aeDkp8x7v46QdH6wtz9ysQFTZAQPwswFfGWQkWcPmKHbeELq_BUUhazt4ppYm9ErYEo7HbFzPCfBid4IQ9qL-hydSgRpJx7w2lNZKh5ylNcb/w1200-h630-p-k-no-nu/Compose%20Camp%203.png",
    "publishDate": "2023-05-22T23:00:00.000Z",
    "type": "Article 📚",
    "topics": [
      "3",
      "20"
    ],
    "authors": []
  }
```

**Step 3: Run test to verify it passes**
Run: `python3 -c "import json; news = json.load(open('nowinandroid/core/network/src/main/assets/news.json')); assert any(n['id'] == '312' for n in news) and any(n['id'] == '313' for n in news)"`
Expected: PASS

**Step 4: Commit**
```bash
git add nowinandroid/core/network/src/main/assets/news.json
git commit -m "feat: add KMP-related news items to news.json"
```

---

### Task 3: Verify with NiA Network DataSource Tests

**Files:**
- Test: `nowinandroid/core/network/src/test/kotlin/com/google/samples/apps/nowinandroid/core/network/demo/DemoNiaNetworkDataSourceTest.kt`

**Step 1: Run existing network tests**
Run: `./gradlew :core:network:test`
Expected: PASS (The existing tests should still pass with the new data.)

**Step 2: Commit (if any test fixes needed)**
```bash
git commit -am "test: verify network data source with new KMP topic"
```
