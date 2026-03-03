# Ticket: Selectable Install Location Scope for Skills/Agents (Workspace + User) (2026-03-03)

**Git HEAD:** ec0e16a562b88edbd787a8634edbe4ade5e0d001

## 1. Requirements

### Problem
현재 설치기는 출력 대상을 `process.cwd()` 기반 workspace 경로로 고정하고 있어, 프로젝트 단위 설치와 개인 전역(User) 설치를 선택적으로 운영할 수 없다.  
사용자는 프로젝트별 분리(Workspace)와 개인 재사용(User) 두 요구를 동시에 만족하길 원한다.

### Audience
신규 사용자(빠른 기본 설치)와 기존 사용자(프로젝트/전역 병행 사용자).

### Success Criteria
설치 위치를 `Workspace`/`User`로 선택할 수 있다.  
설치 위치는 멀티 선택 가능하며 기본값은 `Workspace`만 활성화된다.  
두 위치를 함께 선택하면 한 번 실행으로 두 타깃에 설치된다.  
기존 기본 동작(Workspace 중심)은 깨지지 않는다.  
`--all` 모드에서는 `User` 설치를 허용하지 않는다.

### Non-goals
원격 저장소/URL 직접 설치 메커니즘 추가.  
플랫폼별 경로 구조 전면 재설계.  
sudo/시스템 전역 경로(`/usr/local` 등) 지원.  
설치 위치별 독립 버전 관리/롤백 기능.

### Constraints
`Workspace` 정의는 `process.cwd()`로 고정.  
`User` 루트는 `os.homedir()`로 고정.  
덮어쓰기/업서트 정책은 기존 동작 유지.  
현재 플랫폼 산출 포맷(Claude/Gemini/Codex)은 변경하지 않음.  
`--all`은 여전히 비대화형 전체 설치이며 `User`는 금지.

### Risks
스코프 추가로 설치 루프/결과 출력이 복잡해져 회귀 가능성 증가.  
User 설치 시 홈 디렉터리 대상 파일(`.gemini/settings.json`, `.codex/config.toml`)에 영향 범위가 커짐.  
동일 항목을 두 타깃에 설치할 때 로그 가독성 저하 가능.

### Explorations
TUI에서 설치 위치 선택 단계 추가.  
설치 위치 멀티 선택(Workspace/User 동시 설치) 지원.  
`--all` 정책 분리(Workspace-only 강제).

### Assumptions
기능 1차 범위는 `Workspace`와 `User` 두 스코프만 포함.  
스캔 소스 루트는 기존처럼 현재 workspace(`skills/`, `agents/`)를 유지.  
설치 루트만 스코프별로 달라지고 transform/installer 코어 동작은 재사용.

## 2. Exploration Findings

### Relevant Files

| File            | Purpose     | Key Lines |
| --------------- | ----------- | --------- |
| [installer/src/index.ts](/home/dd/my-agent-skills2/installer/src/index.ts) | 엔트리포인트, 스캔/선택/설치 실행 루프 | 11, 30-39, 45-51, 57 |
| [installer/src/prompts.ts](/home/dd/my-agent-skills2/installer/src/prompts.ts) | 인터랙티브 선택 플로우 | 6-10, 16-25, 27-42, 49-61 |
| [installer/src/installer.ts](/home/dd/my-agent-skills2/installer/src/installer.ts) | 실제 파일 출력 경로 계산 및 write | 30-35, 39-41, 43-51, 56-67, 69-74, 81-84 |
| [installer/platforms.yaml](/home/dd/my-agent-skills2/installer/platforms.yaml) | 플랫폼별 상대 출력 경로 정의 | 4-5, 18-20, 33-35 |
| [installer/src/scanner.ts](/home/dd/my-agent-skills2/installer/src/scanner.ts) | 소스 스캔 규칙(`skills/`, `agents/`) | 40-44, 46-63, 65-67 |
| [installer/src/config.ts](/home/dd/my-agent-skills2/installer/src/config.ts) | 플랫폼 설정 로딩/agent config resolve | 92-109, 161-180, 183-187 |
| [installer/src/transform.ts](/home/dd/my-agent-skills2/installer/src/transform.ts) | placeholder 치환, Gemini/Codex 설정 patch | 10-12, 53-75, 85-102 |
| [installer/src/__tests__/pipeline.test.ts](/home/dd/my-agent-skills2/installer/src/__tests__/pipeline.test.ts) | 경로/부수효과 통합 테스트 기준 | 176-190, 203-223, 229-240, 301-327 |
| [docs/references/claude-subagents.md](/home/dd/my-agent-skills2/docs/references/claude-subagents.md) | Claude project/user scope 근거 | 149-158, 160-163 |
| [docs/references/gemini-subagents.md](/home/dd/my-agent-skills2/docs/references/gemini-subagents.md) | Gemini project/user scope 근거 | 99-104 |
| [docs/agent-skills-guide/eval-skills.md](/home/dd/my-agent-skills2/docs/agent-skills-guide/eval-skills.md) | Codex repo/user scope 예시 | 57-60 |

### Existing Patterns

`projectRoot = process.cwd()`가 소스/타깃 루트에 공용으로 쓰인다.  
`installSkill/installAgent`는 루트 인자를 받아 플랫폼 상대 경로를 조합해 출력한다.  
프롬프트는 체크박스 기반 단계형 구조라 scope 선택 단계를 끼워 넣기 쉽다.  
Gemini/Codex는 에이전트 설치 시 설정 파일 patch 부수효과가 있다.  
`--all`은 프롬프트 없이 전부 설치한다.

### Dependencies

내부 의존성: `index -> scanner/prompts/installer/config`, `installer -> transform/config`.  
외부 의존성: `@inquirer/prompts`, `js-yaml`, `@iarna/toml`, `chalk`, `ora`.

### External Research

없음 (로컬 코드/문서 근거로 결정 가능).

### Technical Constraints

스캔 루트와 설치 루트 분리가 필요하다.  
플랫폼 YAML 경로는 상대 경로 전제이므로 스코프는 base root 변경으로 처리해야 한다.  
`--all`에서 user scope를 열면 전역 파일 변경 리스크가 커진다.  
결과 출력은 현재 workspace 상대 경로 치환 방식이라 scope 라벨링이 필요하다.

## 3. Design

### Chosen Architecture (Detailed architectural specifications to facilitate implementation planning)

- **Component Design**: [installer/src/prompts.ts](/home/dd/my-agent-skills2/installer/src/prompts.ts)에 “install locations” 멀티 체크 단계를 추가하고 기본 체크는 `Workspace`만 유지한다.
- **Component Design**: [installer/src/index.ts](/home/dd/my-agent-skills2/installer/src/index.ts)에서 `workspaceRoot=process.cwd()`, `userRoot=os.homedir()`를 계산하고 선택된 타깃 배열을 구성한다.
- **Component Design**: 설치 루프를 `target -> platform -> skills/agents` 순으로 확장해 동일 파이프라인을 타깃별 반복 실행한다.
- **Component Design**: [installer/src/installer.ts](/home/dd/my-agent-skills2/installer/src/installer.ts)와 [installer/src/transform.ts](/home/dd/my-agent-skills2/installer/src/transform.ts)는 기존 write/upsert 동작을 유지한다.
- **Component Design**: 결과 출력에 scope 라벨(`workspace`, `user`)을 포함해 다중 타깃 설치 로그를 구분한다.
- **Implementation Map**: `prompts.ts`의 `InstallSelections`에 `scopes` 필드를 추가한다.
- **Implementation Map**: `index.ts`에 scope 루트 계산/검증(`--all`에서 user 금지)/중복 루트 제거 로직을 추가한다.
- **Implementation Map**: `index.ts` 결과 출력 포맷을 scope-aware 형태로 변경한다.
- **Implementation Map**: [installer/src/__tests__/pipeline.test.ts](/home/dd/my-agent-skills2/installer/src/__tests__/pipeline.test.ts)에 dual-target 설치 케이스 및 기본 동작 호환성 케이스를 추가한다.
- **Implementation Map**: [README.md](/home/dd/my-agent-skills2/README.md), [installer/README.md](/home/dd/my-agent-skills2/installer/README.md), [AGENTS.md](/home/dd/my-agent-skills2/AGENTS.md)의 설치 플로우 문서를 scope 단계 반영으로 갱신한다.
- **Data Flow**: 사용자 선택(TUI scopes/platforms/skills/agents) 수집 -> scope별 타깃 루트 해석 -> 각 타깃에서 기존 install 함수 호출 -> 타깃별 결과 출력.
- **Build Sequence**: [ ] prompts 타입/질문 단계 확장, [ ] index scope 분기/루프 확장, [ ] 테스트 보강, [ ] 문서 업데이트.
- **Critical Details**: `--all`은 workspace-only 강제, overwrite/upsert 정책은 변경하지 않음, `cwd===homedir`인 경우 중복 타깃 설치를 제거해 이중 write 방지.

### Alternative Architectures Considered

- Alternative 1: Minimal delta (추천안과 동일)로 orchestration 계층만 변경해 빠르게 기능 추가.
- Alternative 2: Clean architecture 분리(`install-scope`, `policy`, `resolver` 모듈 신설)로 구조적 유연성을 우선.
- Alternative 3: Pragmatic balance로 소규모 helper 모듈을 도입해 속도/구조를 절충.

### Decision Rationale

현재 요구는 scope 2종 추가와 명시 정책(`--all` user 금지, overwrite 유지)로 좁고 명확하다.  
따라서 기존 installer/transform 코어를 보존하고 `prompts + index` 중심으로 확장하는 최소 변경 전략이 리스크 대비 효율이 가장 높다.

### Architectural Decision Records (ADRs)

#### ADR 1

- Context: 설치 위치 선택(Workspace/User) 요구가 생겼지만 기존 파이프라인 안정성과 하위호환을 유지해야 함.
- Decision: 스캔은 기존 `cwd`를 유지하고, 설치 타깃만 scope 배열로 분리해 동일 설치 파이프라인을 타깃별 반복 실행.
- Alternatives Considered: Alternative 1 Minimal delta, Alternative 2 Clean architecture, Alternative 3 Pragmatic balance.
- Trade-offs:
   | Option | Pros | Cons |
   | :--- | :--- | :--- |
   | **Chosen** | 구현 빠름, 회귀 범위 최소, 기존 동작 보존 | `index.ts` 루프 복잡도 증가 |
   | **Alternative 2** | 구조적 확장성, 테스트성 우수 | 초기 구현량/파일 증가 |
   | **Alternative 3** | 속도/구조 균형 | 추상화 경계가 중간 수준으로 남음 |
- Consequences:
   - **Positive:** 빠른 출시 가능, 기존 설치 흐름/포맷/업서트 정책 유지.
   - **Negative:** 향후 scope 정책 확장 시 일부 리팩터링 필요 가능.
- Evidence:
   - `index.ts`가 현재 source/target root를 동일 값으로 사용함 ([installer/src/index.ts](/home/dd/my-agent-skills2/installer/src/index.ts)).
   - `installSkill/installAgent`가 루트 인자 기반이어서 타깃 반복 적용이 용이함 ([installer/src/installer.ts](/home/dd/my-agent-skills2/installer/src/installer.ts)).
   - 문서상 각 플랫폼은 project/user scope를 이미 개념적으로 지원함 ([docs/references/claude-subagents.md](/home/dd/my-agent-skills2/docs/references/claude-subagents.md), [docs/references/gemini-subagents.md](/home/dd/my-agent-skills2/docs/references/gemini-subagents.md)).

## 4. Open Questions (if any)

- 비대화형 일반 모드에서 `--scope workspace,user` 플래그를 이번 릴리스에 포함할지(요구사항상 필수 아님).

## 5. Next Actions

- [ ] `prompts.ts`에 scope 멀티 선택 단계(기본 Workspace) 추가
- [ ] `index.ts`에 scope 타깃 루프/`--all` user 금지 정책 반영
- [ ] dual-target 설치 및 호환성 테스트 추가
- [ ] README/installer README/AGENTS 문서 갱신
