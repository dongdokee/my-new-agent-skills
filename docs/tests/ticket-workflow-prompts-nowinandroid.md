# Ticket Workflow Test Prompts (Now in Android)

`ticketing -> ticket-revalidation -> finishing-ticket-implementation` 워크플로우를
테스트하기 위한 예시 프롬프트 5개입니다.

## 공통 가정

- 작업 저장소: `/home/dd/my-agent-skills2/nowinandroid`
- 티켓 아티팩트 경로: `docs/tickets/YYYY-MM-DD-<topic>-ticket.md`
- 브랜치 규칙:
  - 통합 브랜치: `feat/<topic>-integration`
  - 티켓 브랜치: `feat/<topic>-tN`

## Prompt 1: 정상 경로(E2E 성공)

```text
nowinandroid 저장소에서 For You 화면에 "읽은 기사 숨기기" 기능을 추가하려고 한다.
다음 순서로 처리해줘.

1) `ticketing` 스킬:
- topic을 `foryou-read-filter`로 잡고, 의존성 순서가 있는 Provisional 티켓 세트를 만들어
  `docs/tickets/`에 저장해.

2) `ticket-revalidation` 스킬:
- 아래 선행 상태를 근거로 next frontier만 Ready로 올려.
- `foryou-read-filter/1`, `foryou-read-filter/2`는 Integrated 상태라고 가정.

3) 구현 완료 상태를 가정하고 `finishing-ticket-implementation` 스킬:
- 대상 티켓: `foryou-read-filter/3` (현재 status: Implemented)
- 브랜치: `feat/foryou-read-filter-t3`
- 통합 브랜치: `feat/foryou-read-filter-integration`
- 검증 커맨드: `./gradlew assembleDemoDebug demoDebugTest`

AC/검증 증거 확인 후 머지, post-merge 검증 통과 시
`Implemented -> Integrated -> Closed`로 상태를 업데이트해.
```

## Prompt 2: Revalidation 차단(Blocking 질문 남음)

```text
nowinandroid에서 Topic 팔로우 오프라인 복구 개선 작업을 진행한다.
다음 순서로 실행해줘.

1) `ticketing` 스킬:
- topic: `topic-offline-recover`
- feature/topic + core/data + sync/workmanager 범위를 포함해 Provisional 티켓 세트를 작성.

2) `ticket-revalidation` 스킬:
- 선행 티켓 `topic-offline-recover/1`은 Integrated 상태라고 가정.
- 후보 티켓 `topic-offline-recover/2`에 "Room migration 방식 미확정" Blocking Open Question이 남아있다.
- 이 경우 한 번에 한 질문만 하고, Ready Gate를 통과 못하면 Provisional 유지해.

3) `finishing-ticket-implementation` 스킬은 실행 조건 점검:
- Ready/Implemented 조건이 성립하지 않으면 종료하고,
  어떤 조건이 부족해서 종료했는지 명확히 보고해.
```

## Prompt 3: 구조 드리프트로 ticketing 복귀

```text
nowinandroid 검색 기능 개선 작업을 워크플로우로 검증하고 싶다.
진행 순서는 아래와 같다.

1) `ticketing` 스킬:
- topic: `search-query-history`
- feature/search, core/data, core/database를 포함해 Provisional 티켓 세트를 생성.

2) `ticket-revalidation` 스킬:
- 선행 구현 증거를 확인했더니 기존 가정과 다르게
  검색 API 계약이 `core/network`에서 변경된 상태라고 가정.
- Objective/Dependency 변경이 필요한 구조 드리프트로 판단되면
  Ready 승격을 멈추고 `ticketing`으로 되돌리는 결론을 내려.

3) `finishing-ticket-implementation` 스킬:
- 구조 드리프트로 재티켓팅이 필요한 상태라면
  티켓 클로징을 시도하지 말고, 왜 종료 조건이 안 되는지 보고해.
```

## Prompt 4: 머지 충돌 경로 검증

```text
nowinandroid 북마크 동기화 개선 주제에서 다음을 수행해줘.

1) `ticketing` 스킬:
- topic: `bookmark-sync-stability`
- Provisional 티켓 세트를 정리하고 의존 그래프를 만든다.

2) `ticket-revalidation` 스킬:
- `bookmark-sync-stability/1`은 Integrated,
  `bookmark-sync-stability/2`는 Ready를 이미 통과했다고 가정.

3) `finishing-ticket-implementation` 스킬:
- 대상 티켓: `bookmark-sync-stability/2` (Implemented)
- 브랜치: `feat/bookmark-sync-stability-t2`
- 통합 브랜치: `feat/bookmark-sync-stability-integration`
- 머지 시 `core/data`와 `sync/work`에서 충돌이 발생했다고 가정.

필수 요구:
- `git merge --abort` 경로로 안전하게 중단
- status는 Implemented 유지
- blocker와 다음 액션을 티켓 아티팩트에 기록
```

## Prompt 5: Post-merge 테스트 실패/리버트 경로

```text
nowinandroid 온보딩 토픽 추천 정확도 개선 작업을 테스트한다.

1) `ticketing` 스킬:
- topic: `onboarding-topic-ranking`
- Provisional 티켓 세트를 생성.

2) `ticket-revalidation` 스킬:
- next frontier 티켓을 Ready로 승격.

3) `finishing-ticket-implementation` 스킬:
- 대상 티켓: `onboarding-topic-ranking/3` (Implemented)
- 브랜치: `feat/onboarding-topic-ranking-t3`
- 통합 브랜치: `feat/onboarding-topic-ranking-integration`
- 머지는 성공했지만 post-merge 검증 `./gradlew demoDebugTest`가 실패했다고 가정.

필수 요구:
- `git revert --no-edit -m 1 HEAD`로 머지 커밋 롤백
- status를 Implemented로 유지
- 실패 원인과 재시도 조건을 blocker로 남겨
```
