# Design Doc: Add 'Kotlin Multiplatform' Topic to Now in Android

## Overview
This design outlines the process of adding a new topic, 'Kotlin Multiplatform' (KMP), to the Now in Android (NiA) application. The goal is to provide users with a dedicated section for KMP-related news and resources.

## Objectives
- Add 'Kotlin Multiplatform' to the list of available topics.
- Connect at least one news resource to the new topic to verify it appears correctly in the UI.

## Proposed Changes

### 1. Data Layer: Asset Update
The NiA app uses static JSON files as a mock network data source for its demo flavor. We need to update these files to include the new topic and a related news item.

#### `nowinandroid/core/network/src/main/assets/topics.json`
Add the following entry to the end of the list:
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
*Note: We are temporarily using the Kotlin topic icon for KMP.*

#### `nowinandroid/core/network/src/main/assets/news.json`
Add a new news item referencing the new topic (ID: 20):
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
}
```

## Verification Plan
1. **Build and Run**: Build the `demoDebug` variant of the app.
2. **Topic Selection**: Navigate to the 'For You' or 'Interests' screen and verify that 'Kotlin Multiplatform' is listed.
3. **Follow Topic**: Follow the 'Kotlin Multiplatform' topic.
4. **Feed Verification**: Check the 'For You' feed to see if the new news item ("Get started with Kotlin Multiplatform") appears.
5. **Topic Detail**: Navigate to the topic detail screen for KMP and verify the descriptions and connected news.

## Rollback Plan
- Revert the changes to `topics.json` and `news.json` in `nowinandroid/core/network/src/main/assets/`.
