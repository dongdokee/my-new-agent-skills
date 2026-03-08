# Codex sub-agent 정의 방법 (실무 기준 정리)

이 문서는 현재 저장소 기준으로 Codex의 하위 에이전트(sub-agent / spawned thread) 정의 방식과 동작을 정리한다.

## 핵심 요약

- Codex에서 하위 에이전트는 `spawn_agent` 툴의 `agent_type` 인자로 선택된 역할(role) 기반으로 생성된다.
- 역할 정의는 `~/.codex/config.toml`의 `[agents]` 블록에서 관리한다.
- 사용자 정의 역할은 `agents.<role_name>.config_file`로 개별 설정 레이어 TOML을 지정한다.
- 역할이 지정되지 않으면 기본값은 `default`이다.
- `agent_type`이 알 수 없는 역할이면 `unknown agent_type` 오류가 발생한다.

## 정의 위치

- 코드 기준 경로: `codex-rs/core/src/config/mod.rs`
- 역할 스펙/파싱: `codex-rs/core/src/agent/role.rs`
- spawn 툴 스펙: `codex-rs/core/src/tools/spec.rs`
- spawn 실행 핸들러: `codex-rs/core/src/tools/handlers/multi_agents.rs`
- 스키마 참고: `codex-rs/core/config.schema.json`

## config.toml 형식

역할은 다음 형태의 TOML로 정의한다.

```toml
[agents]
max_threads = 8
max_depth = 3
job_max_runtime_seconds = 1800

[agents.research]
description = "Research-focused role"
config_file = "./agents/research.toml"
```

- `description`: spawn 툴 안내에 표시되는 사람 친화적 설명.
- `config_file`: 해당 역할 전용 config layer 파일 경로.
- 상대 경로는 이 `config.toml` 파일이 있는 디렉터리를 기준으로 해석된다.
- `max_threads`, `max_depth`, `job_max_runtime_seconds`는 `agents` 설정의 공통 제한값이다.

## 내부 동작 요약

1. 사용자가 `spawn_agent`를 호출하면 `agent_type`이 전달된다.
2. `apply_role_to_config`가 `agent_type`을 기준으로 역할을 조회한다.
   - 사용자 정의 역할이 있으면 `config_file`을 읽음.
   - 없으면 빌트인 역할(`default`, `explorer`, `worker`)을 확인.
3. 선택 역할의 TOML 레이어가 세션 설정에 병합되어 하위 에이전트별 설정이 적용된다.
4. 하위 에이전트는 `spawn_agent`에서 새 thread로 생성된다.

## 스키마 핵심 포인트

- `config_file`은 `AbsolutePathBuf`(상대 경로 허용)로 저장되며, `agents.<name>.config_file`은 `config.toml` 기준으로 정규화된다.
- `AgentRoleToml`에는 `description`, `config_file`만 들어간다.

## 기본 제공 내장 역할

- `default`: 설정 변경 없음.
- `explorer`: 코드베이스 탐색에 최적화된 룰/프롬프트 설명 제공.
- `worker`: 실행/구현 작업용.

## 사용 예시

`~/.codex/config.toml`
```toml
[agents]
max_threads = 5

[agents.research]
description = "Research-focused role"
config_file = "./agents/research.toml"
```

`~/.codex/agents/research.toml`
```toml
developer_instructions = """
You are a research-focused Codex sub-agent.
- Prefer official docs and code references.
- Return concise findings with evidence.
"""
model_reasoning_effort = "high"
```

예시 호출(개념):
- `spawn_agent(agent_type="research", message="...")`
- `agent_type` 생략 시 `default` 적용.

## 외부 에이전트 마이그레이션(참고)

- `externalAgentConfig/detect`, `externalAgentConfig/import`는 Claude 형식의 AGENTS 설정 자산을 마이그레이션할 때 참조됨.
- Codex의 `agents` 역할 체계는 별도 경로로 `~/.codex/config.toml`에서 관리된다는 점에 유의한다.
