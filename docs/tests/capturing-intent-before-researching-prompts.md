# Test Prompts: Capturing Intent Before Researching (nowinandroid)

이 프롬프트들은 `nowinandroid` 프로젝트를 대상으로 `capturing-intent-before-researching` 스킬의 의도 분석 및 분류 능력을 테스트하기 위해 설계되었습니다.

## Scenario 1: Simple Feature
**User Request:**
"Now in Android 앱에 'Kotlin Multiplatform'이라는 새로운 토픽을 추가해줘."

**Expected Breakdown:**
```text
Intent Breakdown
- (Feature: Add 'Kotlin Multiplatform' topic)
```

## Scenario 2: Multiple Features
**User Request:**
"북마크된 아이템에 대한 검색 필터를 추가하고, 뉴스 기사를 공유할 수 있는 버튼을 구현해줘."

**Expected Breakdown:**
```text
Intent Breakdown
- (Feature: Add search filter for bookmarked items)
- (Feature: Implement share button for news articles)
```

## Scenario 3: Feature + Performance Improvement
**User Request:**
"뉴스 목록에 작성자 이름을 표시해주고, 관심사 화면의 이미지 로딩 속도를 개선해줘."

**Expected Breakdown:**
```text
Intent Breakdown
- (Feature: Display author names in news list)
- (Improvement/Performance: Optimize image loading speed for interest screen)
```

## Scenario 4: Refactoring + Security
**User Request:**
"데이터 레이어를 최신 리포지토리 패턴으로 마이그레이션하고, API 키가 보안 가이드라인에 따라 안전하게 저장되도록 수정해줘."

**Expected Breakdown:**
```text
Intent Breakdown
- (Refactoring: Migrate data layer to latest repository pattern)
- (Security: Ensure secure storage of API keys)
```

## Scenario 5: Complex Request (Mix of all categories)
**User Request:**
"다크 모드 디자인을 개선하고, 로컬 데이터베이스 쿼리 성능을 최적화해줘. 그리고 새로운 기기 로그인 알림 기능을 추가하고 기존의 유닛 테스트 코드를 정리해줬으면 해."

**Expected Breakdown:**
```text
Intent Breakdown
- (Improvement/Feature: Enhance dark mode design)
- (Improvement/Performance: Optimize local database query performance)
- (Feature: Add new device login notification)
- (Refactoring: Clean up existing unit test code)
```

## Scenario 6: Documentation & CI (Others)
**User Request:**
"CONTRIBUTING.md 파일에 새로운 코딩 컨벤션을 추가하고, PR 시 린트 체크를 수행하는 GitHub Action을 업데이트해줘."

**Expected Breakdown:**
```text
Intent Breakdown
- (Others: Add new coding conventions to CONTRIBUTING.md)
- (Others: Update GitHub Action for lint checks on PR)
```
