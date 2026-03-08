# Design Doc: Kotlin Multiplatform Topic Addition

- **Date:** 2026-03-08
- **Topic:** Adding 'Kotlin Multiplatform' to Now in Android topics
- **Author:** Gemini CLI

## Overview

This design outlines the process of adding a new topic, "Kotlin Multiplatform," to the Now in Android application. The goal is to allow users to follow and receive updates specifically related to KMP.

## Background

Now in Android provides a set of topics that users can follow. These topics are managed through a centralized system that synchronizes remote (or demo asset) data with a local Room database.

## Proposed Changes

### 1. Data Layer (Assets)

Modify `nowinandroid/core/network/src/main/assets/topics.json` to include the new topic.

```json
{
  "id": "20",
  "name": "Kotlin Multiplatform",
  "shortDescription": "Write code once, run on Android, iOS, and more.",
  "longDescription": "Explore the power of sharing Kotlin code across different platforms including Android, iOS, Desktop, and Web. Learn about the latest KMP libraries, architecture patterns, and best practices.",
  "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
  "url": ""
}
```

- **ID Strategy:** Use ID "20" (next available ID after 19).
- **Image URL:** Reuse the Kotlin topic icon for consistency, as a dedicated KMP icon is not currently available in the project's Firebase storage.

### 2. Architecture & Data Flow

- **DemoNiaNetworkDataSource:** Reads the updated `topics.json` and exposes it via `getTopics()`.
- **Sync Worker:** Triggered by the app to sync data. It will fetch the updated topic list and insert/update the local Room database using `OfflineFirstTopicsRepository`.
- **UI State:** `InterestsViewModel` and `ForYouViewModel` observe the `TopicsRepository`. The UI will automatically reflect the new topic once the sync is complete.

## Testing & Validation

### Automated Tests
- **Repository Test:** Verify that `OfflineFirstTopicsRepository` correctly processes the new topic from the network data source.
- **DAO Test:** Ensure `TopicDao` can store and retrieve the new topic.

### Manual Verification
1. Launch the app in `demoDebug` variant.
2. Navigate to the "Interests" tab.
3. Verify that "Kotlin Multiplatform" appears in the list of topics.
4. Follow the topic and ensure it persists.

## Alternatives Considered

- **Remote API Change:** Adding via a real backend. Rejected as this is a local development/demo task.
- **Hardcoded insertion in ViewModel:** Rejected as it violates the Offline-first single source of truth (SSOT) principle.
