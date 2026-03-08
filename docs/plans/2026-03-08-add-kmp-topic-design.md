# Design Doc: Adding 'Kotlin Multiplatform' Topic to Now in Android

## Overview
This design outlines the addition of a new topic, "Kotlin Multiplatform" (KMP), to the Now in Android (NiA) application. The goal is to provide users with a dedicated feed for KMP-related news, reflecting its growing importance in the Android ecosystem.

## Goals
- Add "Kotlin Multiplatform" as a selectable topic in the app.
- Populate the KMP feed with realistic, high-quality news items.
- Ensure integration with existing topics (e.g., Compose).

## Proposed Changes

### 1. Data Layer (Demo Flavor)
Since the app uses static JSON files for its "demo" flavor (which is the primary target for this addition), we will modify the following assets in `nowinandroid/core/network/src/main/assets/`:

#### `topics.json`
Add a new topic entry for KMP.
- **ID:** `20`
- **Name:** `Kotlin Multiplatform`
- **Short Description:** (empty, consistent with most topics)
- **Long Description:** `The latest news on Kotlin Multiplatform (KMP), allowing you to share code across platforms like Android, iOS, web, and desktop.`
- **Image URL:** Reusing the Kotlin topic icon for consistency.

#### `news.json`
Add two new news items to ensure the topic is not empty upon discovery.
1. **News ID 312:** "Kotlin Multiplatform is Stable and Ready for Production"
   - Linked to Topic 20.
2. **News ID 313:** "Compose Multiplatform for iOS is in Alpha"
   - Linked to Topics 3 (Compose) and 20 (KMP).

### 2. UI & Interaction
No changes to UI code are required as the app dynamically renders topics and news from the data layer. The new topic will automatically appear in the "Interests" screen and can be followed by users.

## Testing Strategy
- **Manual Verification:** Build and run the app (demo variant) to ensure the "Kotlin Multiplatform" topic appears in the Interests list.
- **Functional Check:** Verify that following the topic populates the "For You" feed with the newly added news items.
- **Data Integrity:** Ensure the JSON files remain valid and well-formatted.

## Alternatives Considered
1. **Placeholder Only:** Adding a generic news item. Rejected in favor of realistic data to provide immediate value.
2. **Topic Only:** Adding the topic without news. Rejected as it would result in an "empty state" experience for the user.
