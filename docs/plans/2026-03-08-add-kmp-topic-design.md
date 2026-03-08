# Design Doc: Add 'Kotlin Multiplatform' Topic to Now in Android

## Overview
Now in Android 앱에 'Kotlin Multiplatform' (KMP)이라는 새로운 토픽을 추가합니다.

## Background
사용자가 KMP 관련 소식을 구독할 수 있도록 토픽 목록에 새로운 항목을 추가할 필요가 있습니다.

## Design
`nowinandroid/core/network/src/main/assets/topics.json` 파일에 새로운 토픽 데이터를 추가합니다.

### New Topic Data
```json
{
  "id": "21",
  "name": "Kotlin Multiplatform",
  "shortDescription": "Android 및 여러 플랫폼에서의 코드 공유 기술에 대한 소식입니다.",
  "longDescription": "Kotlin Multiplatform (KMP)을 사용하여 Android, iOS, 웹, 데스크톱 등 다양한 플랫폼 간에 코드를 공유하는 최신 뉴스를 받아보세요.",
  "imageUrl": "https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2",
  "url": ""
}
```

## Testing Strategy
1. `topics.json` 파일이 올바르게 수정되었는지 확인합니다.
2. (선택 사항) 로컬 빌드를 통해 앱의 토픽 목록 화면에서 'Kotlin Multiplatform'이 나타나는지 확인합니다.
