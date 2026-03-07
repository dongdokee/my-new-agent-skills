# Design: Add Kotlin Multiplatform Topic

## Overview
This document outlines the design for adding a new "Kotlin Multiplatform" topic to the Now in Android app. The goal is to provide users with a dedicated topic focusing on both Kotlin Multiplatform (logic sharing) and Compose Multiplatform (UI sharing).

## Scope & Content
- **Name**: Kotlin Multiplatform
- **Short Description**: "Including Compose Multiplatform"
- **Long Description**: "The latest news and guidance for building cross-platform applications with Kotlin Multiplatform and Compose Multiplatform."
- **Icon**: We will reuse the existing Kotlin topic icon (`ic_topic_Kotlin.svg`) as a placeholder since it is visually relevant and works out-of-the-box without requiring new assets in the Firebase Storage bucket.

## Implementation Approach
We will utilize the "Topic + News Seed" approach to ensure the new topic is fully testable and doesn't appear empty to the user.

1. **Add to Topics Seed**: 
   - Append a new JSON object with ID `"20"` to `nowinandroid/core/network/src/main/assets/topics.json`.
2. **Add to News Seed**: 
   - Find an existing relevant news item in `nowinandroid/core/network/src/main/assets/news.json` (e.g., related to Kotlin or UI).
   - Add the new topic ID (`"20"`) to its `topics` array so that selecting the new topic in the app displays actual content.
3. **No Code Changes**:
   - The data layer (`DemoNiaNetworkDataSource`) automatically deserializes these assets to populate the local Room database upon initialization. No Kotlin code modifications are necessary.
