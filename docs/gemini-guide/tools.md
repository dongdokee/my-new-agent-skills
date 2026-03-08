# Gemini CLI 도구(Tools) 가이드

이 문서는 Gemini CLI에서 사용 가능한 모든 도구의 목록, 기능, 입력 매개변수 및 출력 형식을 설명합니다.

---

## 📂 파일 시스템 도구 (File System Tools)

### `list_directory`
*   **기능**: 지정된 경로 내의 파일 및 하위 디렉토리 목록을 나열합니다.
*   **입력 (Parameters)**:
    *   `dir_path` (string, 필수): 목록을 조회할 디렉토리 경로.
    *   `ignore` (array of strings, 선택): 무시할 글로브 패턴 목록.
    *   `file_filtering_options` (object, 선택): `.gitignore`나 `.geminiignore` 존중 여부 설정.
*   **출력 (Output)**: 디렉토리 내 항목들의 이름 리스트.

### `read_file`
*   **기능**: 특정 파일의 내용을 읽어 반환합니다. 텍스트뿐만 아니라 이미지, 오디오, PDF 파일도 지원합니다.
*   **입력 (Parameters)**:
    *   `file_path` (string, 필수): 읽을 파일의 경로.
    *   `start_line` (number, 선택): 읽기 시작할 라인 번호 (1-기반).
    *   `end_line` (number, 선택): 읽기를 마칠 라인 번호.
*   **출력 (Output)**: 파일의 텍스트 내용 또는 바이너리 데이터의 설명.

### `grep_search`
*   **기능**: 파일 내용 내에서 정규표현식 패턴을 검색합니다. (ripgrep 기반)
*   **입력 (Parameters)**:
    *   `pattern` (string, 필수): 검색할 정규표현식 패턴.
    *   `dir_path` (string, 선택): 검색할 디렉토리 또는 파일 경로.
    *   `include_pattern` (string, 선택): 검색에 포함할 파일 글로브 패턴.
    *   `exclude_pattern` (string, 선택): 검색에서 제외할 패턴.
    *   `names_only` (boolean, 선택): 파일 경로만 반환할지 여부.
    *   `total_max_matches` (number, 선택): 반환할 최대 일치 항목 수 (기본값 100).
*   **출력 (Output)**: 파일 경로, 라인 번호 및 일치하는 라인 내용을 포함하는 문자열.

### `glob`
*   **기능**: 특정 글로브 패턴(예: `src/**/*.ts`)에 일치하는 파일들을 찾습니다.
*   **입력 (Parameters)**:
    *   `pattern` (string, 필수): 매칭할 글로브 패턴.
    *   `dir_path` (string, 선택): 검색을 시작할 기본 디렉토리.
    *   `case_sensitive` (boolean, 선택): 대소문자 구분 여부.
*   **출력 (Output)**: 매칭된 파일들의 절대 경로 목록 (수정 시간순 정렬).

### `write_file`
*   **기능**: 파일에 전체 내용을 씁니다. 파일이 없으면 생성하고, 있으면 덮어씁니다.
*   **입력 (Parameters)**:
    *   `file_path` (string, 필수): 작성할 파일 경로.
    *   `content` (string, 필수): 파일에 쓸 전체 내용.
*   **출력 (Output)**: 파일 작성이 성공했다는 확인 메시지.

### `replace`
*   **기능**: 파일 내의 특정 문자열을 정확하게 찾아 새로운 문자열로 교체합니다.
*   **입력 (Parameters)**:
    *   `file_path` (string, 필수): 수정할 파일 경로.
    *   `instruction` (string, 필수): 코드 변경에 대한 설명적 지침.
    *   `old_string` (string, 필수): 교체 대상이 될 정확한 기존 문자열.
    *   `new_string` (string, 필수): 새로 삽입할 문자열.
    *   `allow_multiple` (boolean, 선택): 동일한 문자열이 여러 개일 때 모두 교체할지 여부 (기본값 false).
*   **출력 (Output)**: 편집이 완료되었다는 확인 메시지.

---

## 💻 시스템 및 실행 도구 (System & Execution Tools)

### `run_shell_command`
*   **기능**: 시스템에서 임의의 셸 명령을 실행합니다.
*   **입력 (Parameters)**:
    *   `command` (string, 필수): 실행할 셸 명령.
    *   `description` (string, 필수): 명령의 목적에 대한 간략한 설명.
    *   `dir_path` (string, 선택): 명령을 실행할 디렉토리.
    *   `is_background` (boolean, 선택): 명령을 백그라운드에서 실행할지 여부.
*   **출력 (Output)**: Stdout, Stderr, 종료 코드, PGID 등을 포함하는 JSON 데이터.

---

## 📋 작업 관리 도구 (Task Management Tools)

### `tracker_create_task`
*   **기능**: 작업 트래커에 새로운 작업을 생성합니다.
*   **입력 (Parameters)**:
    *   `title` (string, 필수): 작업의 제목.
    *   `description` (string, 필수): 작업의 상세 설명.
    *   `type` (enum, 필수): `epic`, `task`, `bug` 중 하나.
    *   `dependencies` (array of strings, 선택): 선행되어야 할 작업 ID 목록.
*   **출력 (Output)**: 생성된 작업의 정보.

### `tracker_update_task`
*   **기능**: 기존 작업의 상태나 내용을 업데이트합니다.
*   **입력 (Parameters)**:
    *   `id` (string, 필수): 업데이트할 작업 ID.
    *   `status` (enum, 선택): `open`, `in_progress`, `blocked`, `closed` 중 하나.
    *   `title`, `description`, `dependencies` 등 (선택 사항).
*   **출력 (Output)**: 업데이트된 작업의 정보.

### `tracker_list_tasks` / `tracker_get_task` / `tracker_visualize`
*   **기능**: 작업 목록을 조회하거나, 특정 작업의 상세 정보를 확인하고, 전체 작업의 의존성 구조를 시각화합니다.
*   **출력 (Output)**: 작업 리스트, 상세 데이터 또는 ASCII 트리 형태의 시각화 결과.

---

## 🧠 지능형 에이전트 및 스킬 (Intelligence & Skills)

### `codebase_investigator` (Sub-agent)
*   **기능**: 코드베이스 분석, 아키텍처 매핑, 시스템 의존성 이해를 위한 전문 하위 에이전트를 호출합니다.
*   **입력 (Parameters)**: `objective` (목표 설명).
*   **출력 (Output)**: 핵심 파일 경로, 심볼 및 아키텍처 통찰력을 포함한 구조화된 보고서.

### `generalist` (Sub-agent)
*   **기능**: 대량의 데이터 처리나 반복적인 리팩토링 작업을 수행하는 일반 목적의 하위 에이전트를 호출합니다.
*   **입력 (Parameters)**: `request` (수행할 작업 요청).
*   **출력 (Output)**: 작업 수행 결과 요약.

### `activate_skill`
*   **기능**: 특정 분야의 전문 지침(Skill)을 로드하여 에이전트의 능력을 확장합니다.
*   **입력 (Parameters)**: `name` (예: `skill-creator`, `writing-plans` 등).
*   **출력 (Output)**: 활성화된 기술의 상세 지침 및 리소스.

---

## 🌐 외부 데이터 및 웹 도구 (External Data & Web Tools)

### `google_web_search`
*   **기능**: 구글 검색을 통해 최신 정보를 검색합니다.
*   **입력 (Parameters)**: `query` (검색어).
*   **출력 (Output)**: 출처 정보와 함께 종합된 검색 결과.

### `web_fetch`
*   **기능**: 특정 URL의 콘텐츠를 가져와 분석하거나 요약합니다.
*   **입력 (Parameters)**: `prompt` (URL 및 추출 지침).
*   **출력 (Output)**: 분석된 결과 답변.

---

## 🛠 기타 유틸리티 (Other Utilities)

### `ask_user`
*   **기능**: 사용자에게 질문을 던져 추가 정보, 선호도 또는 결정을 요청합니다.
*   **입력 (Parameters)**: `questions` (질문 객체 배열).
*   **출력 (Output)**: 사용자의 답변 데이터.

### `save_memory`
*   **기능**: 프로젝트와 무관한 전역적인 사용자 선호도나 사실을 영구적으로 저장합니다.
*   **입력 (Parameters)**: `fact` (저장할 사실).
*   **출력 (Output)**: 메모리 저장 완료 메시지.

### `enter_plan_mode`
*   **기능**: 코드를 수정하기 전에 안전하게 연구하고 설계를 수행하는 '계획 모드'로 진입합니다.
*   **입력 (Parameters)**: `reason` (진입 이유).
*   **출력 (Output)**: 계획 모드 전환 안내.

### `cli_help`
*   **기능**: Gemini CLI의 기능, 문서, 현재 설정 등에 대해 답변합니다.
*   **입력 (Parameters)**: `question` (질문).
*   **출력 (Output)**: 상세 답변 및 관련 소스.
