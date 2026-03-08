# Design Doc: Add Kotlin Multiplatform Topic to Now in Android

## Overview
Add a new "Kotlin Multiplatform" topic to the "Now in Android" application to track related news items.

## Proposed Changes
1. **Core Assets**: Add a new topic entry to `nowinandroid/core/network/src/main/assets/topics.json`.
   - ID: 20
   - Name: Kotlin Multiplatform
   - Short Description: Share code between different platforms (e.g., Android, iOS, Web)
   - Long Description: Learn how to share your business logic, data layers, and more between Android, iOS, Web, and desktop apps using Kotlin Multiplatform.
   - ImageUrl: `https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2`
2. **News Data**: Update the topics array of news item ID 211 ("ADB Podcast 180: Kotlin Magic Platform") in `nowinandroid/core/network/src/main/assets/news.json` to include the new topic ID 20.
3. **Test Data**: Add "Kotlin Multiplatform" to the test data list in `nowinandroid/core/testing/src/main/kotlin/com/google/samples/apps/nowinandroid/core/testing/data/TopicsTestData.kt` for testing consistency.

## Success Criteria
- The "Kotlin Multiplatform" topic is visible in the application's topic list.
- News item 211 is correctly tagged with the new topic.
- Relevant tests pass with the new topic in the test data.
