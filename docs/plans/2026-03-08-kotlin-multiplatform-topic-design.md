# Kotlin Multiplatform Topic Addition Design

## Overview
Add a new topic called 'Kotlin Multiplatform' to the Now in Android app's demo data.

## Goal
- Make 'Kotlin Multiplatform' available as a selectable/followable topic in the demo/dev builds.
- Ensure the data structure matches the existing `NetworkTopic` schema.

## Approach
- Modify `nowinandroid/core/network/src/main/assets/topics.json`.
- Add a new entry at the end of the JSON array.
- Use a new unique ID (e.g., "20").
- Use a placeholder or similar URL for `imageUrl`.

## Data Schema
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

## Testing Strategy
- Manual verification: Run the app (demo flavor) and check if the 'Kotlin Multiplatform' topic appears in the Interest/Follow screen.
- Automated verification: Update or add a unit test in `DemoNiaNetworkDataSourceTest` if applicable to ensure it loads the new topic correctly.
