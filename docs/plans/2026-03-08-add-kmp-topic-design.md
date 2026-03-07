# Design: Adding 'Kotlin Multiplatform' Topic

## 1. 개요 (Overview)
'Now in Android' 앱의 데모 데이터에 'Kotlin Multiplatform' (KMP) 토픽을 새롭게 추가하여, 사용자가 관심 있는 주제로 선택할 수 있도록 함.

## 2. 세부 설계 (Detailed Design)

### 2.1 데이터 소스 수정 (Data Source Update)
`nowinandroid/core/network/src/main/assets/topics.json` 파일에 ID 20인 새로운 객체를 추가.

- **ID:** `20`
- **Name:** `Kotlin Multiplatform`
- **Short Description:** `Sharing code across platforms`
- **Long Description:** `The latest news and resources on Kotlin Multiplatform (KMP), enabling code sharing across Android, iOS, web, and desktop.`
- **Image URL:** 기존 Kotlin 아이콘 URL 재사용
  - `https://firebasestorage.googleapis.com/v0/b/now-in-android.appspot.com/o/img%2Fic_topic_Kotlin.svg?alt=media&token=bdc73380-e80d-47df-8954-d9b61cccacd2`

### 2.2 영향 범위 (Impact Scope)
- **Networking:** `DemoNiaNetworkDataSource`가 업데이트된 JSON을 읽어들임.
- **Sync:** SyncWorker가 실행될 때 새로운 토픽 데이터가 Room 데이터베이스로 동기화됨.
- **UI:** 'Interests' 화면 및 'For You' 화면의 토픽 목록에 노출됨.

## 3. 검증 계획 (Validation Plan)
1. **JUnit Test:** `DemoNiaNetworkDataSourceTest.kt`를 실행하여 20번째 토픽이 'Kotlin Multiplatform'인지 검증.
2. **Build Test:** `./gradlew assembleDemoDebug` 실행을 통해 리소스 및 코드 무결성 확인.

## 4. 구현 단계 (Implementation Steps)
1. `topics.json` 에셋 파일 수정.
2. 관련 테스트 코드 확인 및 업데이트.
3. 빌드 및 테스트 수행.
