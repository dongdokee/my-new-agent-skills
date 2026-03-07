# Kotlin Multiplatform Topic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 'Kotlin Multiplatform' to the app's topic list by modifying the demo assets and verifying with tests.

**Architecture:** Update the static JSON asset used by `DemoNiaNetworkDataSource` to include the new topic.

**Tech Stack:** Kotlin, JSON, JUnit 4, Kotlinx Serialization.

---

### Task 1: Update topics.json Asset

**Files:**
- Modify: `nowinandroid/core/network/src/main/assets/topics.json`

**Step 1: Add Kotlin Multiplatform topic to JSON**

Append the following object to the array in `topics.json`:
```json
  {
    "id": "20",
    "name": "Kotlin Multiplatform",
    "shortDescription": "Sharing code across platforms",
    "longDescription": "The latest news and resources on Kotlin Multiplatform (KMP), enabling code sharing across Android, iOS, web, and desktop.",
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
    "url": ""
  }
```

**Step 2: Commit**

```bash
git add nowinandroid/core/network/src/main/assets/topics.json
git commit -m "feat: add Kotlin Multiplatform topic to demo assets"
```

### Task 2: Verify with Unit Test

**Files:**
- Test: `nowinandroid/core/network/src/test/kotlin/com/google/samples/apps/nowinandroid/core/network/demo/DemoNiaNetworkDataSourceTest.kt`

**Step 1: Write/Update test to verify 20 topics**

Modify the test or add a new one to check if the 20th topic is KMP.

```kotlin
@Test
fun demoDataSource_loads_kmp_topic() = runTest {
    val topics = subject.getTopics()
    val kmpTopic = topics.find { it.id == "20" }
    assertEquals("Kotlin Multiplatform", kmpTopic?.name)
}
```

**Step 2: Run test to verify it passes**

Run: `./gradlew :core:network:testDemoDebugUnitTest --tests "com.google.samples.apps.nowinandroid.core.network.demo.DemoNiaNetworkDataSourceTest"`
Expected: BUILD SUCCESSFUL (all tests pass)

**Step 3: Commit**

```bash
git add nowinandroid/core/network/src/test/kotlin/com/google/samples/apps/nowinandroid/core/network/demo/DemoNiaNetworkDataSourceTest.kt
git commit -m "test: verify Kotlin Multiplatform topic loading"
```

### Task 3: Final Build Verification

**Step 1: Run demo build**

Run: `./gradlew assembleDemoDebug`
Expected: BUILD SUCCESSFUL
