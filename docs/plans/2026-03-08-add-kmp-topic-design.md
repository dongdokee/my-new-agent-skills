# Design: Add Kotlin Multiplatform Topic to Now in Android

## Overview
This design outlines the addition of a new topic, "Kotlin Multiplatform" (KMP), to the Now in Android (NIA) application. The goal is to provide users with news and resources specifically related to sharing code across multiple platforms.

## Goals
- Add "Kotlin Multiplatform" as a selectable topic in the NIA app.
- Ensure the new topic is available in the demo flavor of the app.
- Maintain consistency across testing environments by updating test data.

## Detailed Design

### 1. Update Demo Assets
The NIA app uses a JSON file as a static data source for its demo flavor. We will append the new topic to this file.

- **File**: `nowinandroid/core/network/src/main/assets/topics.json`
- **New Topic Data**:
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
  *Note: Using the Architecture topic's icon as a placeholder for now.*

### 2. Update Testing Data
To ensure that unit tests and instrumented tests that rely on sample data continue to pass and correctly reflect the app's state, we will update the test data provider.

- **File**: `nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt`
- **Change**: Add a new `Topic` instance to the `topicsTestData` list matching the JSON structure above.

## Validation Strategy
1. **Unit Tests**: Run tests in `OfflineFirstTopicsRepositoryTest.kt` and `TopicsTestData.kt` related tests to ensure the new data is correctly mapped and retrieved.
2. **Data Integrity**: Use `grep` to verify that the ID "20" and the name "Kotlin Multiplatform" are present in both the JSON asset and the Kotlin test file.
3. **Build Verification**: Run `./gradlew assembleDemoDebug` (if feasible in the environment) to ensure no serialization issues were introduced.
