# Spec 작성 가이드

Coding agent 또는 사람 개발자가 구현 작업을 위임·수행할 때 사용하는 Spec의 구조, 품질 기준, 분할 방법을 정의한다. 1개의 Spec은 agent에게 한 번에 위임할 수 있는 단위의 작업에 해당한다.

---

## 1. Spec 항목 정의 및 품질 속성

### Objective

**정의:** 이 Spec의 목적과 기대 결과를 한 문장으로 서술한 것. 단일 ticket type에 해당해야 한다.

**Ticket types:**

| Type | 정의 |
|------|------|
| Feature | 새로운 기능 추가 |
| Improvement | 기존 기능의 동작 개선 (기능은 변경되지만 새 기능은 아님) |
| Bug | 의도와 다른 동작의 수정 |
| Refactoring | 외부 동작 변경 없이 내부 구조 개선 |
| Documentation | 문서 추가/수정 |
| Test | 테스트 추가/수정 (프로덕션 코드 변경 없음) |

| 품질 속성 | 설명 | Good | Bad |
|-----------|------|------|-----|
| Specific | 하나의 해석만 가능한 구체적 서술 | "설정 파일에 필수 필드 누락 시 `ValidationError`를 반환한다" | "입력 검증을 개선한다" |
| Testable | 읽고 나서 달성 여부를 판별할 수 있음 | "빈 배열 입력 시 빈 배열을 반환한다" | "안정적으로 동작한다" |
| Singular | 한 문장, 하나의 목표 | "`formatter.py`에 CSV 출력 함수를 추가한다" | "CSV 출력 함수를 추가하고 기존 포맷터를 리팩터링한다" |

### In-Scope

**정의:** 이 Spec에서 변경하거나 생성할 대상의 목록.

| 품질 속성 | 설명 | Good | Bad |
|-----------|------|------|-----|
| Enumerable | 개별 항목으로 나열 가능 | "- `src/auth/login.ts`의 `validateToken()` 함수<br>- `src/auth/types.ts`의 타입 정의" | "인증 관련 파일들" |
| Locatable | agent가 코드베이스에서 찾을 수 있는 경로/모듈/함수 수준 | "`src/api/users.ts`의 `findByEmail()`" | "API 로직 어딘가" |
| Bounded | 전체를 합쳤을 때 하나의 작업 단위로 완결 | "타입 정의 + 변환 함수 + 해당 단위 테스트" | "API 모듈 전체" |

### Out-of-Scope

**정의:** 이 Spec에서 명시적으로 건드리지 않을 대상.

| 품질 속성 | 설명 | Good | Bad |
|-----------|------|------|-----|
| Negative | "하지 않을 것"만 기술 | "기존 `exportToCsv()` 함수는 수정하지 않는다" | "기존 CSV 내보내기는 현재 상태를 유지한다" (긍정형 서술이므로 변경 의도가 있는 것처럼 읽힘) |
| Firm | 조건부가 아닌 단정적 제외 | "CLI 인터페이스 변경 없음" | "필요하면 CLI도 건드릴 수 있음" |
| Relevant | 혼동 가능성이 있는 항목만 명시 | "같은 파일 내 `exportToCsv()`는 변경하지 않는다" | "데이터베이스 스키마는 변경하지 않는다" (애초에 DB가 없음) |

### Acceptance Criteria

**정의:** Spec 완료를 판정하는 조건의 목록.

| 품질 속성 | 설명 | Good | Bad |
|-----------|------|------|-----|
| Binary | 각 항목이 충족/미충족으로 판별 가능 | "`required: true`인 필드가 누락되면 `ValidationError`를 throw한다" | "에러 처리가 적절히 동작한다" |
| Observable | 외부에서 동작이나 출력으로 확인 가능 | "프로젝트 테스트 스위트 실행 시 전체 통과" | "내부 구조가 깔끔하다" |
| Complete | happy path + 주요 edge case를 커버 | "1) 정상 입력 → JSON 출력 2) 빈 입력 → 빈 객체 3) 잘못된 필드 → 에러" | "JSON이 올바르게 생성된다" (happy path만) |

### Validation Method

**정의:** Acceptance Criteria 각 항목을 검증하는 구체적 수단.

| 품질 속성 | 설명 | Good | Bad |
|-----------|------|------|-----|
| Executable | agent가 직접 실행할 수 있는 명령이나 절차 | "`pytest tests/test_formatter.py -k test_csv_output`" | "CSV 출력을 확인한다" |
| Reproducible | 누가 실행해도 동일한 결과 | "`python main.py --export` 실행 후 `output/report.csv` 존재 확인" | "수동으로 테스트해본다" |
| Mapped | AC 항목과 1:1 대응 | "AC1 → test case `test_valid_output`<br>AC2 → test case `test_empty_input`" | "전체 테스트 스위트 실행" (어떤 AC를 검증하는지 불명) |

### Constraints

**정의:** 구현 방식에 대한 기술적 제약 조건.

| 품질 속성 | 설명 | Good | Bad |
|-----------|------|------|-----|
| Explicit | 암묵적 가정이 아닌 명문화된 규칙 | "기존 public API의 함수 시그니처 변경 금지" | "하위호환성 유지" (무엇의 하위호환?) |
| Actionable | 위반 여부를 코드 수준에서 판별 가능 | "외부 라이브러리 추가 금지, 표준 라이브러리만 사용" | "의존성을 최소화한다" |
| Prioritized | 제약 간 충돌 시 우선순위가 명시됨 | "하위호환 > 성능 최적화. 시그니처 보존이 우선" | "하위호환도 중요하고 성능도 중요하다" |

### Risks

**정의:** 구현 과정에서 발생 가능한 기술적 리스크.

| 품질 속성 | 설명 | Good | Bad |
|-----------|------|------|-----|
| Causal | 원인과 결과가 명시됨 | "날짜 포맷 파싱이 로케일에 따라 달라지면 CSV 출력에서 정렬이 깨짐" | "날짜 파싱이 어려울 수 있음" |
| Mitigatable | 각 리스크에 대한 회피/완화 방향이 있음 | "ISO 8601 포맷을 강제하고 로케일 무관 파싱 테스트 추가" | "주의해서 구현한다" |
| Scoped | In-Scope 범위 내에서 발생하는 리스크만 포함 | "변환 함수 변경이 기존 JSON 출력에 영향을 줄 수 있음" | "향후 플랫폼 추가 시 확장이 어려울 수 있음" (미래 이야기) |

---

## 2. Spec 분할 기준

복합적인 Spec은 단일 의도를 가진 여러 Spec으로 분할한다. 분할된 각 Spec은 이 문서의 모든 항목(Objective ~ Risks)을 갖춘 완전한 Spec이다.

### 분할 판정 기준

하나의 Spec으로 유지할 수 있는 조건 — **모두 충족**해야 함:

1. **단일 의도** — "이 Spec은 X를 한다"로 설명 가능하며, 단일 ticket type(`Feature`, `Refactoring`, `Bug`, `Improvement`, `Documentation`, `Test`)에 해당
2. **즉시 검증 가능** — Spec 완료 시점에 실행할 검증 수단이 존재
3. **실패 원인 특정 가능** — 검증 실패 시 이 Spec 내에서 원인을 찾을 수 있음

하나라도 안 되면 쪼개거나 병합한다.

### 분할 절차

1. Ticket type이 복수 섞여 있으면 type별로 우선 분리
2. 각 type 내에서 AC를 나열하고 필요한 코드 변경을 식별
3. 변경이 겹치는 AC를 하나의 Spec으로 그룹핑
4. 각 Spec이 분할 판정 기준 3가지를 충족하는지 확인
5. Spec 간 의존 순서를 결정 (선행 Spec 없이 검증 불가능한 경우)
6. 각 Spec에 검증 수단이 있는지 확인 — 검증 불가능한 Spec은 앞뒤로 병합
7. 분할된 각 Spec에 대해 Objective ~ Risks 항목을 작성
8. 각 Spec에 `<세트-이름>/<순번>` 형식의 ID를 부여한다

### 의존성 규칙

- 순환 의존 금지
- 의존이 없는 Spec끼리는 순서 무관
- 공통 기반 변경(타입 정의, 설정 등)은 첫 번째 Spec으로 배치

### 의존성 표기법

분할된 Spec 간 의존 관계는 각 Spec의 Objective 아래에 `depends_on`으로 명시한다.

```
### Objective

(depends_on: user-notifications/1)

알림 발송 서비스를 추가하여 ...
```

- `depends_on`이 없는 Spec은 독립적이며 순서 무관
- 복수 의존 시 쉼표로 나열: `(depends_on: user-notifications/1, user-notifications/2)`
- Spec ID는 `<분할-세트-이름>/<순번>` 형식으로 부여 (예: `user-notifications/1`, `user-notifications/2`). 세트 이름은 원본 요구사항을 kebab-case로 요약

### 분할하지 않는 경우

- 전체 변경이 분할 판정 기준 3가지를 모두 충족하면 단일 Spec으로 수행
- 분할 시 Spec이 독립적으로 검증 불가능해지면 분할하지 않음

---

## 3. Spec 예시

### Objective

REST API에 CSV 내보내기 엔드포인트를 추가하여, 사용자가 데이터를 CSV 파일로 다운로드할 수 있게 한다.

### In-Scope

- `src/services/export_service.py` — `generate_csv()` 함수 추가
- `src/models/export_config.py` — `ExportConfig` 데이터 클래스 추가
- `src/routes/export.py` — `GET /api/exports/csv` 엔드포인트 추가
- `tests/test_export_service.py` — 내보내기 서비스 단위 테스트 추가

### Out-of-Scope

- 기존 `GET /api/exports/json` 엔드포인트는 수정하지 않는다
- 내보내기 이력 저장 로직은 이 Spec의 범위가 아니다

### Acceptance Criteria

1. `GET /api/exports/csv?table=users` 호출 시 유효한 CSV 파일이 응답으로 반환된다
2. `table` 파라미터가 누락되면 `400 Bad Request`를 반환한다
3. 존재하지 않는 테이블명을 전달하면 `404 Not Found`를 반환한다
4. CSV 헤더 행이 테이블 컬럼명과 일치한다
5. 기존 테스트가 전부 통과한다

### Validation Method

| AC | 검증 방법 |
|----|-----------|
| AC1 | `test_export_service.py::test_valid_csv_export` — 정상 응답 및 CSV 파싱 검증 |
| AC2 | `test_export_service.py::test_missing_table_param` — 400 상태 코드 확인 |
| AC3 | `test_export_service.py::test_invalid_table_name` — 404 상태 코드 확인 |
| AC4 | `test_export_service.py::test_csv_header_matches_columns` — 헤더 행 비교 |
| AC5 | 프로젝트 테스트 스위트 전체 실행 |

### Constraints

- 외부 CSV 라이브러리 추가 금지. 표준 라이브러리의 CSV 모듈만 사용
- 기존 `/api/exports/` 하위 엔드포인트의 응답 형식 변경 금지
- 하위호환 > 기능 확장. 기존 API 시그니처 보존이 우선

### Risks

| 리스크 | 완화 방안 |
|--------|-----------|
| CSV 필드에 쉼표나 줄바꿈이 포함된 경우 파싱 오류 | AC1 테스트에 특수문자 포함 데이터로 검증 |
| 대용량 테이블 내보내기 시 메모리 초과 | 스트리밍 응답 방식으로 구현하고, 1만 행 데이터로 성능 테스트 추가 |

---

## 4. Spec 분할 예시

아래는 복합적인 요구사항을 분할하는 과정을 보여주는 예시다.

### 원본 요구사항

> "사용자 알림 시스템을 추가한다. 알림 데이터 모델을 정의하고, 알림 발송 서비스를 구현하며, API 엔드포인트를 추가하고, 전체 흐름을 검증하는 통합 테스트를 작성한다."

### 분할 판정

- **단일 의도?** — No. Feature(데이터 모델) + Feature(발송 서비스) + Feature(API 엔드포인트) + Test(통합 테스트) 4가지 의도가 섞여 있음
- **실패 원인 특정 가능?** — No. 테스트 실패 시 모델 문제인지, 서비스 로직 문제인지, API 라우팅 문제인지, 테스트 자체의 문제인지 구분 불가

→ 분할이 필요하다.

### 분할 결과

#### user-notifications/1: 알림 데이터 모델 및 저장소 추가 (Feature)

**Objective**

알림 데이터 모델과 저장소 계층을 추가하여, 알림을 생성·조회·삭제할 수 있는 데이터 기반을 마련한다.

**In-Scope**

- `src/models/notification.py` — `Notification` 데이터 클래스 정의
- `src/repositories/notification_repo.py` — `NotificationRepository` 클래스 추가 (CRUD 메서드)
- `tests/test_notification_repo.py` — 저장소 단위 테스트 추가

**Out-of-Scope**

- 알림 발송 로직은 다루지 않는다
- API 엔드포인트는 이 Spec의 범위가 아니다

**Acceptance Criteria**

1. `Notification` 모델에 `id`, `user_id`, `message`, `created_at`, `is_read` 필드가 존재한다
2. `NotificationRepository.create(notification)`이 저장 후 ID가 할당된 객체를 반환한다
3. `NotificationRepository.find_by_user(user_id)`가 해당 사용자의 알림 목록을 반환한다
4. `NotificationRepository.delete(id)`가 존재하지 않는 ID에 대해 `NotFoundError`를 raise한다

**Validation Method**

| AC | 검증 방법 |
|----|-----------|
| AC1 | `test_notification_repo.py::test_notification_model_fields` — 필드 존재 확인 |
| AC2 | `test_notification_repo.py::test_create_notification` — 생성 및 ID 할당 검증 |
| AC3 | `test_notification_repo.py::test_find_by_user` — 사용자별 조회 검증 |
| AC4 | `test_notification_repo.py::test_delete_nonexistent` — 예외 발생 확인 |

**Constraints**

- ORM 사용 금지. 직접 SQL 또는 인메모리 저장소로 구현
- 다른 모듈에 대한 의존 없이 독립적으로 동작해야 함

**Risks**

| 리스크 | 완화 방안 |
|--------|-----------|
| 인메모리 저장소가 실제 DB 동작과 달라 후속 Spec에서 문제 발생 | Repository 인터페이스를 추상화하여 구현 교체 가능하게 설계 |

---

#### user-notifications/2: 알림 발송 서비스 추가 (Feature)

**Objective**

(depends_on: user-notifications/1)

알림 발송 서비스를 추가하여, 비즈니스 로직에서 사용자에게 알림을 생성하고 발송할 수 있게 한다.

**In-Scope**

- `src/services/notification_service.py` — `NotificationService` 클래스 추가 (`send()`, `mark_as_read()` 메서드)
- `tests/test_notification_service.py` — 서비스 단위 테스트 추가

**Out-of-Scope**

- 데이터 모델 및 저장소 변경은 하지 않는다 (user-notifications/1에서 완료)
- API 엔드포인트는 다루지 않는다

**Acceptance Criteria**

1. `NotificationService.send(user_id, message)`가 알림을 생성하고 저장소에 저장한다
2. `NotificationService.mark_as_read(notification_id)`가 해당 알림의 `is_read`를 `True`로 변경한다
3. 존재하지 않는 `notification_id`로 `mark_as_read()` 호출 시 `NotFoundError`를 raise한다

**Validation Method**

| AC | 검증 방법 |
|----|-----------|
| AC1 | `test_notification_service.py::test_send_creates_notification` — 생성 및 저장 확인 |
| AC2 | `test_notification_service.py::test_mark_as_read` — 상태 변경 확인 |
| AC3 | `test_notification_service.py::test_mark_as_read_nonexistent` — 예외 발생 확인 |

**Constraints**

- user-notifications/1의 `NotificationRepository` 공개 인터페이스만 사용. 내부 구현 직접 참조 금지
- 외부 메시징 시스템 연동은 이 단계에서 하지 않음 (인메모리 처리)

**Risks**

| 리스크 | 완화 방안 |
|--------|-----------|
| 저장소 인터페이스 변경 시 서비스 코드도 수정 필요 | 저장소를 의존성 주입으로 받아 mock 테스트 가능하게 구현 |

---

#### user-notifications/3: 알림 API 엔드포인트 추가 (Feature)

**Objective**

(depends_on: user-notifications/1, user-notifications/2)

알림 관련 REST API 엔드포인트를 추가하여, 클라이언트가 HTTP를 통해 알림을 조회하고 읽음 처리할 수 있게 한다.

**In-Scope**

- `src/routes/notifications.py` — `GET /api/notifications`, `PATCH /api/notifications/{id}/read` 엔드포인트 추가
- `tests/test_notification_routes.py` — API 엔드포인트 단위 테스트 추가

**Out-of-Scope**

- 데이터 모델, 저장소, 서비스 로직의 변경은 하지 않는다
- 알림 삭제 API는 이 Spec의 범위가 아니다

**Acceptance Criteria**

1. `GET /api/notifications?user_id=123` 호출 시 해당 사용자의 알림 목록을 JSON으로 반환한다
2. `user_id` 파라미터 누락 시 `400 Bad Request`를 반환한다
3. `PATCH /api/notifications/456/read` 호출 시 해당 알림을 읽음 처리하고 `200 OK`를 반환한다
4. 존재하지 않는 알림 ID로 PATCH 호출 시 `404 Not Found`를 반환한다

**Validation Method**

| AC | 검증 방법 |
|----|-----------|
| AC1 | `test_notification_routes.py::test_get_notifications` — 목록 응답 확인 |
| AC2 | `test_notification_routes.py::test_missing_user_id` — 400 상태 코드 확인 |
| AC3 | `test_notification_routes.py::test_mark_notification_read` — 200 응답 및 상태 변경 확인 |
| AC4 | `test_notification_routes.py::test_mark_nonexistent_notification` — 404 상태 코드 확인 |

**Constraints**

- user-notifications/2의 `NotificationService` 공개 인터페이스만 사용
- 기존 API 라우트의 URL 패턴 및 응답 형식 변경 금지

**Risks**

| 리스크 | 완화 방안 |
|--------|-----------|
| 서비스 계층 예외가 적절한 HTTP 상태 코드로 매핑되지 않음 | 에러 핸들러에서 `NotFoundError` → 404 매핑을 명시적으로 테스트 |

---

#### user-notifications/4: 알림 통합 테스트 추가 (Test)

**Objective**

(depends_on: user-notifications/1, user-notifications/2, user-notifications/3)

알림 시스템의 전체 흐름(모델 생성 → 서비스 발송 → API 응답)을 검증하는 통합 테스트를 추가한다.

**In-Scope**

- `tests/integration/test_notification_flow.py` — 알림 시스템 통합 테스트 추가

**Out-of-Scope**

- 모델, 서비스, API의 구현 변경은 하지 않는다 (user-notifications/1~3에서 완료)
- 성능 테스트, 부하 테스트는 다루지 않는다

**Acceptance Criteria**

1. 알림 발송 후 `GET /api/notifications`에서 해당 알림이 조회된다
2. 읽음 처리 후 재조회 시 `is_read`가 `True`로 반환된다
3. 전체 테스트 스위트가 통과한다

**Validation Method**

| AC | 검증 방법 |
|----|-----------|
| AC1 | `test_notification_flow.py::test_send_then_list` — 발송 후 조회 확인 |
| AC2 | `test_notification_flow.py::test_read_then_verify` — 읽음 처리 후 상태 확인 |
| AC3 | 프로젝트 테스트 스위트 전체 실행 |

**Constraints**

- user-notifications/1~3의 공개 인터페이스만 사용. 내부 함수 직접 호출 금지
- 테스트는 격리된 환경에서 실행하고 teardown에서 정리

**Risks**

| 리스크 | 완화 방안 |
|--------|-----------|
| 테스트 간 상태 공유로 인한 간헐적 실패 | 각 테스트 케이스에서 독립적인 데이터 세트를 사용하고 teardown에서 초기화 |

---

### 분할 의존 관계 요약

```
user-notifications/1 (데이터 모델 + 저장소)
  ↓
user-notifications/2 (발송 서비스)         ← depends_on: user-notifications/1
  ↓
user-notifications/3 (API 엔드포인트)      ← depends_on: user-notifications/1, user-notifications/2
  ↓
user-notifications/4 (통합 테스트)          ← depends_on: user-notifications/1, user-notifications/2, user-notifications/3
```

---

## 5. Spec 빈 템플릿

새 Spec 작성 시 아래 skeleton을 복사하여 사용한다.

```markdown
### Objective

### In-Scope

### Out-of-Scope

### Acceptance Criteria

### Validation Method

### Constraints

### Risks
```
