# Codex Tools 가이드

이 문서는 현재 Codex 세션에서 사용 가능한 tool들의 목록, 기능, 입력, 출력을 정리합니다.

기준 범위:
- `functions.*`
- `multi_tool_use.parallel`
- `web.run`

## 1) `functions` 네임스페이스

### `functions.exec_command`
- 기능: 로컬 셸 명령 실행(단발 실행 또는 PTY 세션 시작).
- 입력:
  - `cmd` (string, 필수): 실행할 셸 명령.
  - `justification` (string, 선택): 샌드박스 외 실행 승인 요청 문구.
  - `login` (boolean, 선택): 로그인/인터랙티브 셸 여부.
  - `max_output_tokens` (number, 선택): 최대 출력 토큰 수.
  - `prefix_rule` (string[], 선택): 향후 유사 명령 승인 규칙 제안.
  - `sandbox_permissions` (string, 선택): `use_default` 또는 `require_escalated`.
  - `shell` (string, 선택): 사용할 셸 바이너리.
  - `tty` (boolean, 선택): PTY 할당 여부.
  - `workdir` (string, 선택): 작업 디렉터리.
  - `yield_time_ms` (number, 선택): 출력 대기 시간.
- 출력:
  - 단발 실행 결과(표준출력/표준에러/종료코드) 또는
  - 지속 세션의 `session_id`(추가 입출력은 `write_stdin`으로 처리).

### `functions.write_stdin`
- 기능: 실행 중인 PTY 세션에 입력 전달 또는 출력 폴링.
- 입력:
  - `session_id` (number, 필수): 대상 세션 ID.
  - `chars` (string, 선택): 전달할 stdin 문자.
  - `max_output_tokens` (number, 선택): 최대 출력 토큰.
  - `yield_time_ms` (number, 선택): 출력 대기 시간.
- 출력:
  - 해당 세션의 최신 출력(최근 stdout/stderr).

### `functions.update_plan`
- 기능: 작업 계획 단계 상태 업데이트.
- 입력:
  - `explanation` (string, 선택): 업데이트 설명.
  - `plan` (array, 필수): 단계 목록.
    - `step` (string): 단계 설명.
    - `status` (string): `pending | in_progress | completed`.
- 출력:
  - 계획 반영 결과(업데이트된 계획 상태).

### `functions.request_user_input`
- 기능: 1~3개의 짧은 선택형 질문으로 사용자 입력 요청.
- 입력:
  - `questions` (array, 필수): 질문 목록.
    - `header` (string): 질문 헤더(12자 이하 권장).
    - `id` (string): 응답 매핑용 식별자.
    - `question` (string): 질문 문장.
    - `options` (array): 2~3개 선택지(`label`, `description`).
- 출력:
  - 사용자 선택 결과(클라이언트가 제공하는 자유입력 포함 가능).
- 참고:
  - 현재 Default 모드에서는 비활성화될 수 있음.

### `functions.view_image`
- 기능: 로컬 이미지 파일 열람.
- 입력:
  - `path` (string, 필수): 이미지 절대/상대 경로.
- 출력:
  - 이미지 로딩 결과(이미지 컨텍스트가 대화에 반영됨).

### `functions.spawn_agent`
- 기능: 하위 에이전트 생성(병렬 작업 위임).
- 입력:
  - `agent_type` (string, 선택): `default | explorer | worker`.
  - `fork_context` (boolean, 선택): 현재 대화 컨텍스트 포크 여부.
  - `message` (string, 선택): 초기 작업 지시.
  - `items` (array, 선택): 구조화 입력(`text`, `image`, `local_image`, `skill`, `mention`).
- 출력:
  - 생성된 에이전트 정보(`id`, 사용자 표시용 닉네임 등).

### `functions.send_input`
- 기능: 기존 에이전트에 추가 입력 전달.
- 입력:
  - `id` (string, 필수): 대상 에이전트 ID.
  - `interrupt` (boolean, 선택): 현재 작업 중단 후 즉시 처리 여부.
  - `message` (string, 선택): 텍스트 입력.
  - `items` (array, 선택): 구조화 입력.
- 출력:
  - 메시지 전달 결과(즉시 처리 또는 큐잉 상태).

### `functions.resume_agent`
- 기능: 종료된 에이전트 재개.
- 입력:
  - `id` (string, 필수): 재개할 에이전트 ID.
- 출력:
  - 에이전트 재개 상태.

### `functions.wait`
- 기능: 에이전트 완료까지 대기.
- 입력:
  - `ids` (string[], 필수): 대기할 에이전트 ID 목록.
  - `timeout_ms` (number, 선택): 대기 타임아웃(ms).
- 출력:
  - 완료된 에이전트의 최종 상태(또는 타임아웃 시 빈 상태).

### `functions.close_agent`
- 기능: 에이전트 종료 및 마지막 상태 반환.
- 입력:
  - `id` (string, 필수): 종료할 에이전트 ID.
- 출력:
  - 종료 결과 + 마지막 known 상태.

### `functions.spawn_agents_on_csv`
- 기능: CSV 각 행에 대해 워커 에이전트를 생성해 일괄 처리.
- 입력:
  - `csv_path` (string, 필수): 입력 CSV 경로.
  - `instruction` (string, 필수): 행별 템플릿 지시문(`{column}` 치환).
  - `id_column` (string, 선택): 항목 식별용 컬럼.
  - `max_concurrency` (number, 선택): 동시 실행 수.
  - `max_workers` (number, 선택): `max_concurrency` 별칭.
  - `max_runtime_seconds` (number, 선택): 워커 최대 실행 시간.
  - `output_schema` (object, 선택): 워커 보고 결과 스키마.
  - `output_csv_path` (string, 선택): 결과 CSV 경로.
- 출력:
  - 전체 행 처리 결과 + 결과 CSV 파일 생성(기본 경로 또는 지정 경로).

### `functions.apply_patch`
- 기능: 패치 문법으로 파일 생성/수정/삭제.
- 입력:
  - 자유형 문자열(FREEFORM) 패치:
    - `*** Begin Patch` / `*** End Patch`
    - `*** Add File`, `*** Update File`, `*** Delete File`
    - hunk 문법(`@@`, `+`, `-`, 공백 컨텍스트)
- 출력:
  - 패치 적용 성공/실패 결과.

## 2) `multi_tool_use` 네임스페이스

### `multi_tool_use.parallel`
- 기능: 서로 독립적인 여러 개발자 도구 호출을 병렬 실행.
- 입력:
  - `tool_uses` (array, 필수):
    - `recipient_name` (string): 예) `functions.exec_command`
    - `parameters` (object): 해당 도구 호출 파라미터
- 출력:
  - 각 병렬 호출 결과의 집계 응답.
- 제약:
  - 개발자 도구만 호출 가능(시스템 도구 직접 호출 불가).
  - 병렬 안전한 작업만 묶어야 함.

## 3) `web` 네임스페이스

### `web.run`
- 기능: 웹 검색/탐색/시세/날씨/스포츠/시간 조회를 단일 엔드포인트로 수행.
- 입력:
  - 공통:
    - `response_length` (string, 선택): `short | medium | long`
  - 검색/탐색:
    - `search_query[]`: `q`, `recency`, `domains`
    - `image_query[]`: `q`, `recency`, `domains`
    - `open[]`: `ref_id`, `lineno`
    - `click[]`: `ref_id`, `id`
    - `find[]`: `ref_id`, `pattern`
    - `screenshot[]`: `ref_id`, `pageno`
  - 정형 데이터:
    - `finance[]`: `ticker`, `type`, `market`
    - `weather[]`: `location`, `start`, `duration`
    - `sports[]`: `fn`, `league`, `team`, `opponent`, `date_from`, `date_to`, `num_games`, `locale`
    - `time[]`: `utc_offset`
- 출력:
  - 요청 타입별 구조화된 결과.
  - 검색/열람 계열은 후속 호출용 `ref_id`(예: `turn0search0`)를 반환.

## 빠른 인덱스

| Tool | 주요 용도 | 입력 형태 | 출력 형태 |
|---|---|---|---|
| `functions.exec_command` | 셸 명령 실행 | JSON | 실행 로그/세션 ID |
| `functions.write_stdin` | 세션 입출력 | JSON | 세션 최신 출력 |
| `functions.update_plan` | 계획 관리 | JSON | 계획 상태 |
| `functions.request_user_input` | 사용자 선택 수집 | JSON | 사용자 응답 |
| `functions.view_image` | 로컬 이미지 열람 | JSON | 로딩 결과 |
| `functions.spawn_agent` | 하위 에이전트 생성 | JSON | 에이전트 ID |
| `functions.send_input` | 에이전트 메시지 전달 | JSON | 전달 상태 |
| `functions.resume_agent` | 에이전트 재개 | JSON | 재개 상태 |
| `functions.wait` | 에이전트 대기 | JSON | 완료/타임아웃 상태 |
| `functions.close_agent` | 에이전트 종료 | JSON | 종료 + 마지막 상태 |
| `functions.spawn_agents_on_csv` | CSV 배치 위임 | JSON | 집계 결과 + 결과 CSV |
| `functions.apply_patch` | 파일 패치 | FREEFORM 문자열 | 적용 성공/실패 |
| `multi_tool_use.parallel` | 도구 병렬 실행 | JSON | 병렬 결과 집계 |
| `web.run` | 웹/정형 데이터 조회 | JSON | 검색 결과/구조화 데이터 |

