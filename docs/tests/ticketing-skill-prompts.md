# Ticketing Skill Test Prompts (Repository-Specific)

Use these prompts to test whether the `ticketing` skill can decompose ambiguous, mixed-scope requests into dependency-ordered tickets with quality-governed specs for this repository.

## Evaluation Criteria

Each test should verify:

- Set-based IDs (`<set-name>/N`) with kebab-case set names matching the topic token.
- Splitting criteria applied (single intent, immediately verifiable, failure-traceable).
- Each ticket contains a Spec with quality-attribute-governed fields.
- `depends_on:` notation used for inter-ticket dependencies; omitted for independent tickets.
- AC and Validation Method are 1:1 mapped.
- Conditional fields (Constraints, Risks) appear only when justified.

## Prompt 1

`installer/src/scanner.ts` 쪽이 요즘 느리고 깊은 디렉토리 구조에서 스킬을 종종 놓쳐. 재귀 depth 제어랑 async 스캔으로 바꾸고, 기존 결과랑 호환성은 깨지지 않게 해줘. 그리고 `SKILL.md` 쪽 문서 가이드도 업데이트하고 테스트까지 한 번에 정리해줘. 우선순위는 네가 알아서 잡아줘.

### Expected Ticket Sequence

1. `scanner-async/1` `Feature` - Add recursive depth-aware skill scanning.
2. `scanner-async/2` `Refactoring` - Convert scanner flow from sync I/O to async traversal. (depends_on: scanner-async/1)
3. `scanner-async/3` `Documentation` - Update scanner behavior and usage guidance in docs/SKILL text. (depends_on: scanner-async/1, scanner-async/2)
4. `scanner-async/4` `Test` - Add/adjust tests for deep path detection and async behavior stability. (depends_on: scanner-async/1, scanner-async/2)

## Prompt 2

`researching`이랑 `ticketing`이 역할이 겹치는 느낌이라 정리하고 싶어. 사용자 입장에서는 명령어 하나로 보였으면 좋겠고, 기존에 `research` 명령 쓰던 사람들도 안 깨지면 좋겠어. README, installer 테스트, Gemini command, migration 안내까지 어디까지 자동화할지 포함해서 설계부터 작업 단위로 쪼개줘.

### Expected Ticket Sequence

1. `skill-unification/1` `Feature` - Define and implement a unified command entrypoint behavior.
2. `skill-unification/2` `Refactoring` - Restructure overlapping skill boundaries and command routing logic. (depends_on: skill-unification/1)
3. `skill-unification/3` `Improvement` - Introduce compatibility/migration strategy for existing `research` users. (depends_on: skill-unification/1, skill-unification/2)
4. `skill-unification/4` `Documentation` - Update README and migration guidance. (depends_on: skill-unification/1, skill-unification/2, skill-unification/3)
5. `skill-unification/5` `Test` - Add installer/command compatibility tests for legacy and new paths. (depends_on: skill-unification/1, skill-unification/2)

## Prompt 3

지금 `{{tool.*}}` placeholder 품질을 강하게 관리하고 싶어. 새 키가 생기면 `installer/platforms.yaml` 매핑 누락이 절대 안 나게 하고, 텍스트 안에 남는 placeholder도 빌드 전에 잡고 싶어. 그런데 개발자 경험은 너무 빡세지 않았으면 좋겠고, 기존 skill들이 바로 다 깨지는 방식은 피하고 싶어. 어떤 식으로 단계적으로 적용할지까지 포함해줘.

### Expected Ticket Sequence

1. `placeholder-governance/1` `Feature` - Add placeholder mapping completeness validation.
2. `placeholder-governance/2` `Refactoring` - Integrate placeholder residue checks into transform/pipeline flow. (depends_on: placeholder-governance/1)
3. `placeholder-governance/3` `Improvement` - Add staged enforcement mode to avoid abrupt breakage. (depends_on: placeholder-governance/1, placeholder-governance/2)
4. `placeholder-governance/4` `Documentation` - Document placeholder governance and rollout policy. (depends_on: placeholder-governance/1, placeholder-governance/2, placeholder-governance/3)
5. `placeholder-governance/5` `Test` - Add regression tests for missing mapping and unresolved placeholder cases. (depends_on: placeholder-governance/1, placeholder-governance/2)

## Prompt 4

`node installer/dist/index.js --all` 실행할 때 스킬이 늘어나면 시간이 길어질 것 같아. 스캔/변환/설치 구간을 병렬화하거나 캐시를 넣는 방향을 고민 중인데, 로그 가독성하고 실패 시 원인 추적성은 유지되어야 해. 플랫폼별 부작용(예: Gemini settings patch)도 안전해야 하고. 이걸 기능/리팩토링/테스트/문서 관점으로 나눠서 티켓화해줘.

### Expected Ticket Sequence

1. `installer-perf/1` `Feature` - Add parallelization and/or caching strategy for `--all` pipeline.
2. `installer-perf/2` `Refactoring` - Rework execution orchestration to preserve deterministic logging and failure tracing. (depends_on: installer-perf/1)
3. `installer-perf/3` `Documentation` - Update operational guidance for performance mode and failure analysis. (depends_on: installer-perf/1, installer-perf/2)
4. `installer-perf/4` `Test` - Add tests for speed-path correctness, side-effect safety, and log traceability. (depends_on: installer-perf/1, installer-perf/2)

## Prompt 5

에이전트 frontmatter(`profile + tools`)가 잘못 들어와도 지금은 뒤늦게 알게 되는 경우가 있어. 스캔 단계에서 더 빨리 검증하고, 에러 메시지도 사람이 바로 고칠 수 있게 바꾸고 싶어. 동시에 legacy `platforms:` 포맷은 당분간 유지해야 해. 이 변경을 최소 리스크로 출시하려면 어떤 티켓 순서가 좋은지, 그리고 각 티켓의 완료 기준까지 잡아줘.

### Expected Ticket Sequence

1. `frontmatter-validation/1` `Feature` - Add early frontmatter validation during scanning.
2. `frontmatter-validation/2` `Refactoring` - Unify validation pipeline for `profile+tools` and legacy `platforms:` paths. (depends_on: frontmatter-validation/1)
3. `frontmatter-validation/3` `Improvement` - Improve human-actionable error messaging and remediation hints. (depends_on: frontmatter-validation/1, frontmatter-validation/2)
4. `frontmatter-validation/4` `Documentation` - Update authoring conventions for agent frontmatter. (depends_on: frontmatter-validation/1, frontmatter-validation/2, frontmatter-validation/3)
5. `frontmatter-validation/5` `Test` - Add validation tests covering both modern and legacy formats. (depends_on: frontmatter-validation/1, frontmatter-validation/2)
