# Claude Code Tools 가이드

이 문서는 Claude Code 세션에서 사용 가능한 모든 tool의 목록, 기능, 입력, 출력을 정리합니다.

## 카테고리 개요

| 카테고리 | Tools |
|---|---|
| 파일 시스템 | `Read`, `Write`, `Edit`, `Glob` |
| 검색 | `Grep` |
| 실행 | `Bash` |
| 에이전트/서브에이전트 | `Agent`, `Skill`, `ToolSearch` |
| 태스크 관리 | `TaskCreate`, `TaskGet`, `TaskList`, `TaskOutput`, `TaskStop`, `TaskUpdate` |
| 크론 | `CronCreate`, `CronDelete`, `CronList` |
| 웹 | `WebFetch`, `WebSearch` |
| 노트북 | `NotebookEdit` |
| 사용자 인터랙션 | `AskUserQuestion` |
| 플래닝/워크트리 | `EnterPlanMode`, `ExitPlanMode`, `EnterWorktree` |
| IDE 통합 | `mcp__ide__executeCode`, `mcp__ide__getDiagnostics` |

---

## 1. 파일 시스템

### `Read`
- **기능**: 로컬 파일 내용을 읽어 반환. 텍스트, 이미지(PNG/JPG 등), PDF, Jupyter Notebook(.ipynb) 지원.
- **입력**:
  - `file_path` (string, 필수): 읽을 파일의 절대 경로.
  - `offset` (number, 선택): 읽기를 시작할 줄 번호.
  - `limit` (number, 선택): 읽을 줄 수 (파일이 클 때 사용).
  - `pages` (string, 선택): PDF 전용 페이지 범위 (예: `"1-5"`, `"3"`). 최대 20페이지.
- **출력**:
  - `cat -n` 형식의 파일 내용 (줄 번호 포함).
  - 이미지: 시각적으로 렌더링된 결과.
  - PDF: 지정 페이지 텍스트.
  - `.ipynb`: 코드/텍스트/출력 셀 전체.
- **제약**:
  - 기본 최대 2000줄 반환. 2000자 초과 줄은 잘림.
  - 10페이지 초과 PDF는 반드시 `pages` 파라미터 지정 필요.

---

### `Write`
- **기능**: 파일을 생성하거나 전체 내용을 덮어씀.
- **입력**:
  - `file_path` (string, 필수): 쓸 파일의 절대 경로.
  - `content` (string, 필수): 파일에 쓸 내용.
- **출력**:
  - 쓰기 성공/실패 결과.
- **제약**:
  - 기존 파일을 수정할 때는 반드시 `Read`로 먼저 읽은 후 사용해야 함.
  - 기존 파일 부분 수정은 `Edit`이 더 적합.

---

### `Edit`
- **기능**: 파일 내 특정 문자열을 정확히 찾아 다른 문자열로 교체 (diff만 전송, 효율적).
- **입력**:
  - `file_path` (string, 필수): 수정할 파일의 절대 경로.
  - `old_string` (string, 필수): 교체할 기존 문자열 (파일 내 유일해야 함).
  - `new_string` (string, 필수): 대체할 새 문자열.
  - `replace_all` (boolean, 선택, 기본값 `false`): `true`이면 파일 내 모든 일치 항목을 교체.
- **출력**:
  - 교체 성공/실패 결과.
- **제약**:
  - `old_string`이 파일 내에서 유일하지 않으면 실패. 더 넓은 컨텍스트를 포함하거나 `replace_all` 사용.
  - 사용 전 반드시 `Read`로 파일을 먼저 읽어야 함.
  - 들여쓰기(탭/스페이스) 정확히 일치해야 함.

---

### `Glob`
- **기능**: 글로브 패턴으로 파일 경로를 검색. 수정 시간 순으로 정렬된 경로 목록 반환.
- **입력**:
  - `pattern` (string, 필수): 글로브 패턴 (예: `"**/*.ts"`, `"src/**/*.tsx"`).
  - `path` (string, 선택): 검색 시작 디렉토리. 미지정 시 현재 작업 디렉토리.
- **출력**:
  - 패턴에 일치하는 파일 경로 목록 (수정 시간 내림차순).
- **적합한 사용처**: 이름 패턴으로 파일 찾기.

---

## 2. 검색

### `Grep`
- **기능**: ripgrep 기반 파일 내용 검색. 정규식 완전 지원.
- **입력**:
  - `pattern` (string, 필수): 검색할 정규식 패턴.
  - `path` (string, 선택): 검색 대상 파일 또는 디렉토리. 기본값: 현재 작업 디렉토리.
  - `glob` (string, 선택): 파일 필터 글로브 (예: `"*.js"`, `"**/*.tsx"`).
  - `type` (string, 선택): 파일 타입 필터 (예: `"js"`, `"py"`, `"rust"`).
  - `output_mode` (string, 선택): 출력 형식.
    - `"files_with_matches"` (기본): 일치 파일 경로만 반환.
    - `"content"`: 일치하는 줄 내용 반환.
    - `"count"`: 파일별 일치 수 반환.
  - `-i` (boolean, 선택): 대소문자 무시.
  - `-n` (boolean, 선택): 줄 번호 표시 (content 모드 전용).
  - `-C` / `context` (number, 선택): 일치 전후 N줄 표시 (content 모드 전용).
  - `-A` (number, 선택): 일치 후 N줄 표시.
  - `-B` (number, 선택): 일치 전 N줄 표시.
  - `multiline` (boolean, 선택): 멀티라인 패턴 매칭 활성화 (`rg -U --multiline-dotall`).
  - `head_limit` (number, 선택): 반환 결과 상위 N개 제한.
  - `offset` (number, 선택): N개 건너뛰고 반환.
- **출력**:
  - `output_mode`에 따라 파일 경로 목록 / 일치 내용 / 카운트.

---

## 3. 실행

### `Bash`
- **기능**: 배시 명령을 실행하고 결과(stdout/stderr/종료코드)를 반환.
- **입력**:
  - `command` (string, 필수): 실행할 bash 명령.
  - `description` (string, 선택): 명령 설명 (사용자 리뷰용).
  - `timeout` (number, 선택): 타임아웃(ms). 최대 600000ms(10분). 기본 120000ms(2분).
  - `run_in_background` (boolean, 선택): 백그라운드 실행 여부. 완료 시 알림.
- **출력**:
  - 명령의 stdout, stderr, 종료코드.
- **제약**:
  - `find`, `grep`, `cat` 등 전용 도구가 있는 작업은 해당 도구 사용 권장.
  - 경로에 공백이 있으면 큰따옴표로 묶어야 함.
  - 인터랙티브 플래그(`-i`) 사용 불가.

---

## 4. 에이전트/서브에이전트

### `Agent`
- **기능**: 특화된 서브에이전트(subprocess)를 실행하여 복잡한 멀티스텝 태스크를 자율 처리.
- **입력**:
  - `description` (string, 필수): 에이전트 작업 설명 (3-5단어 요약).
  - `prompt` (string, 필수): 에이전트에게 전달할 상세 작업 지시.
  - `subagent_type` (string, 선택): 에이전트 유형.
    - `"general-purpose"`: 범용 에이전트 (기본값).
    - `"Explore"`: 코드베이스 탐색 전문 에이전트.
    - `"Plan"`: 구현 계획 설계 에이전트.
    - `"claude-code-guide"`: Claude Code/API 질문 전문 에이전트.
    - `"statusline-setup"`: 상태표시줄 설정 에이전트.
  - `resume` (string, 선택): 이전 에이전트 ID를 지정하면 해당 에이전트를 재개.
  - `run_in_background` (boolean, 선택): 백그라운드 실행.
  - `isolation` (string, 선택): `"worktree"` 지정 시 임시 git worktree에서 격리 실행.
- **출력**:
  - 에이전트의 최종 결과 메시지 + `agent_id`.

---

### `Skill`
- **기능**: 사용자 정의 스킬(슬래시 커맨드)을 실행.
- **입력**:
  - `skill` (string, 필수): 스킬 이름 (예: `"commit"`, `"review-pr"`).
  - `args` (string, 선택): 스킬에 전달할 추가 인수.
- **출력**:
  - 스킬 실행 결과 (스킬에 따라 다름).
- **제약**:
  - 시스템 리마인더에 나열된 사용자 호출 가능 스킬에만 사용 가능.

---

### `ToolSearch`
- **기능**: 지연 로드(deferred) 도구를 검색하거나 직접 선택하여 활성화.
- **입력**:
  - `query` (string, 필수): 키워드 검색 또는 `"select:<tool_name>"` 형태의 직접 선택.
  - `max_results` (number, 선택, 기본값 5): 최대 반환 결과 수.
- **출력**:
  - 일치하는 도구 목록. 반환된 도구는 즉시 사용 가능.
- **제약**:
  - deferred 도구는 이 도구로 먼저 로드해야 호출 가능.
  - 키워드 검색으로 반환된 도구를 다시 `select:`로 검색하면 중복이므로 불필요.

---

## 5. 태스크 관리

### `TaskCreate`
- **기능**: 백그라운드 비동기 태스크를 생성하여 실행.
- **입력**:
  - `description` (string, 필수): 태스크 설명.
  - `prompt` (string, 필수): 태스크 실행 지시.
  - (기타 파라미터는 구현에 따라 다를 수 있음)
- **출력**:
  - 생성된 태스크 ID 및 초기 상태.

---

### `TaskGet`
- **기능**: 특정 태스크의 현재 상태를 조회.
- **입력**:
  - `task_id` (string, 필수): 조회할 태스크 ID.
- **출력**:
  - 태스크 상태, 진행 정보.

---

### `TaskList`
- **기능**: 현재 세션의 모든 태스크 목록을 반환.
- **입력**: 없음.
- **출력**:
  - 태스크 ID, 설명, 상태를 포함한 목록.

---

### `TaskOutput`
- **기능**: 백그라운드 태스크의 출력(stdout/stderr)을 읽음.
- **입력**:
  - `task_id` (string, 필수): 대상 태스크 ID.
- **출력**:
  - 태스크의 표준 출력/에러.

---

### `TaskStop`
- **기능**: 실행 중인 태스크를 중단.
- **입력**:
  - `task_id` (string, 필수): 중단할 태스크 ID.
- **출력**:
  - 중단 결과.

---

### `TaskUpdate`
- **기능**: 태스크 메타데이터(설명 등)를 업데이트.
- **입력**:
  - `task_id` (string, 필수): 수정할 태스크 ID.
  - `description` (string, 선택): 새 설명.
- **출력**:
  - 업데이트 결과.

---

## 6. 크론

### `CronCreate`
- **기능**: 주기적으로 실행되는 크론 작업을 등록.
- **입력**:
  - `schedule` (string, 필수): 크론 표현식 또는 간격 (예: `"5m"`, `"0 9 * * *"`).
  - `prompt` (string, 필수): 주기적으로 실행할 작업 지시.
  - `description` (string, 선택): 크론 작업 설명.
- **출력**:
  - 생성된 크론 ID.

---

### `CronDelete`
- **기능**: 등록된 크론 작업을 삭제.
- **입력**:
  - `cron_id` (string, 필수): 삭제할 크론 ID.
- **출력**:
  - 삭제 결과.

---

### `CronList`
- **기능**: 현재 등록된 크론 작업 전체를 나열.
- **입력**: 없음.
- **출력**:
  - 크론 ID, 스케줄, 설명을 포함한 목록.

---

## 7. 웹

### `WebFetch`
- **기능**: 지정한 URL의 웹 페이지를 가져와 내용 반환.
- **입력**:
  - `url` (string, 필수): 가져올 URL.
  - `prompt` (string, 필수): 반환 내용에서 추출할 정보 지시.
- **출력**:
  - 페이지 내용 (Markdown 변환 또는 원문).
- **제약**:
  - 사용자가 제공한 URL 또는 프로그래밍 관련 명확한 URL에만 사용.

---

### `WebSearch`
- **기능**: 웹 검색을 수행하고 결과를 반환.
- **입력**:
  - `query` (string, 필수): 검색 쿼리.
- **출력**:
  - 검색 결과 목록 (제목, URL, 스니펫).

---

## 8. 노트북

### `NotebookEdit`
- **기능**: Jupyter Notebook(.ipynb) 파일의 셀을 편집/추가/삭제.
- **입력**:
  - `notebook_path` (string, 필수): 수정할 노트북 파일의 절대 경로.
  - `new_source` (string, 필수): 셀에 쓸 새 내용.
  - `cell_id` (string, 선택): 편집할 셀 ID. 미지정 시 새 셀 추가.
  - `cell_type` (string, 선택): `"code"` 또는 `"markdown"`.
  - `edit_mode` (string, 선택): `"replace"`, `"insert"`, `"delete"`.
  - `insert_after` (string, 선택): 이 셀 ID 다음에 삽입.
- **출력**:
  - 편집 성공/실패 결과.

---

## 9. 사용자 인터랙션

### `AskUserQuestion`
- **기능**: 사용자에게 질문을 제시하고 응답을 기다림.
- **입력**:
  - `question` (string, 필수): 사용자에게 물어볼 질문.
  - `options` (string[], 선택): 선택지 목록 (제공 시 선택형으로 표시).
- **출력**:
  - 사용자의 응답 텍스트.
- **적합한 사용처**: 필수 정보가 부족하거나 사용자 확인이 필요할 때.

---

## 10. 플래닝/워크트리

### `EnterPlanMode`
- **기능**: 계획 수립 모드로 진입. 이 모드에서는 파일 수정 등 실행 액션 없이 계획만 수립.
- **입력**: 없음.
- **출력**:
  - 플래닝 모드 진입 확인.

---

### `ExitPlanMode`
- **기능**: 계획 수립 모드에서 나와 실행 모드로 복귀.
- **입력**: 없음.
- **출력**:
  - 실행 모드 복귀 확인.

---

### `EnterWorktree`
- **기능**: 격리된 git worktree 환경으로 진입하여 독립적인 작업 수행.
- **입력**:
  - `path` (string, 선택): worktree 경로.
- **출력**:
  - worktree 진입 결과.

---

## 11. IDE 통합 (MCP)

### `mcp__ide__executeCode`
- **기능**: IDE 내 코드 실행 환경(커널/REPL)에서 코드를 실행.
- **입력**:
  - `code` (string, 필수): 실행할 코드.
  - `language` (string, 선택): 실행 언어 (예: `"python"`, `"javascript"`).
- **출력**:
  - 실행 결과(stdout/stderr) 및 반환값.

---

### `mcp__ide__getDiagnostics`
- **기능**: IDE의 현재 진단 정보(린트 오류, 타입 오류 등)를 조회.
- **입력**:
  - `file_path` (string, 선택): 특정 파일의 진단 정보만 조회 시 지정.
- **출력**:
  - 파일별 진단 항목 목록 (오류/경고 메시지, 위치).

---

## 빠른 인덱스

| Tool | 주요 용도 | 입력 | 출력 |
|---|---|---|---|
| `Read` | 파일 읽기 | 절대 경로, offset/limit/pages | 파일 내용 (줄 번호 포함) |
| `Write` | 파일 생성/덮어쓰기 | 절대 경로, content | 성공/실패 |
| `Edit` | 파일 부분 수정 | 절대 경로, old/new string | 성공/실패 |
| `Glob` | 파일 경로 검색 | glob 패턴, 시작 디렉토리 | 파일 경로 목록 |
| `Grep` | 파일 내용 검색 | 정규식, 경로, 글로브/타입 필터 | 경로 목록 / 내용 / 카운트 |
| `Bash` | 셸 명령 실행 | 명령, 타임아웃, 백그라운드 여부 | stdout/stderr/종료코드 |
| `Agent` | 서브에이전트 실행 | 에이전트 유형, 프롬프트 | 결과 메시지 + agent_id |
| `Skill` | 스킬 실행 | 스킬 이름, 인수 | 스킬별 결과 |
| `ToolSearch` | 지연 도구 활성화 | 키워드 또는 select: 이름 | 도구 목록 (즉시 활성화) |
| `TaskCreate` | 백그라운드 태스크 생성 | 설명, 프롬프트 | 태스크 ID |
| `TaskGet` | 태스크 상태 조회 | 태스크 ID | 상태 정보 |
| `TaskList` | 태스크 목록 조회 | — | 태스크 목록 |
| `TaskOutput` | 태스크 출력 읽기 | 태스크 ID | stdout/stderr |
| `TaskStop` | 태스크 중단 | 태스크 ID | 중단 결과 |
| `TaskUpdate` | 태스크 메타 수정 | 태스크 ID, 설명 | 업데이트 결과 |
| `CronCreate` | 크론 작업 등록 | 스케줄, 프롬프트 | 크론 ID |
| `CronDelete` | 크론 작업 삭제 | 크론 ID | 삭제 결과 |
| `CronList` | 크론 작업 목록 | — | 크론 목록 |
| `WebFetch` | 웹 페이지 조회 | URL, 추출 지시 | 페이지 내용 |
| `WebSearch` | 웹 검색 | 검색 쿼리 | 검색 결과 목록 |
| `NotebookEdit` | 노트북 셀 편집 | 노트북 경로, 셀 내용 | 성공/실패 |
| `AskUserQuestion` | 사용자 질문 | 질문, 선택지(선택) | 사용자 응답 |
| `EnterPlanMode` | 플래닝 모드 진입 | — | 모드 전환 확인 |
| `ExitPlanMode` | 플래닝 모드 종료 | — | 모드 전환 확인 |
| `EnterWorktree` | worktree 진입 | 경로(선택) | 진입 결과 |
| `mcp__ide__executeCode` | IDE 코드 실행 | 코드, 언어 | 실행 결과 |
| `mcp__ide__getDiagnostics` | IDE 진단 조회 | 파일 경로(선택) | 진단 항목 목록 |
