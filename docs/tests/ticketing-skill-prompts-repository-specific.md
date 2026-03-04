# Ticketing Skill Test Prompts (Repository-Specific)

Use these prompts to test whether the `ticketing` skill can decompose ambiguous, mixed-scope requests into dependency-ordered tickets with quality-governed specs for this repository.

## Evaluation Criteria

Each test should verify:

- Set-based IDs (`<set-name>/N`) with kebab-case set names matching the topic token.
- Splitting criteria applied (single intent, immediately verifiable, failure-traceable).
- Each ticket starts with `Provisional` status (no `Ready` promotion in `ticketing`).
- Each ticket contains a Provisional Spec with explicit open questions.
- `depends_on:` notation used for inter-ticket dependencies; omitted for independent tickets.
- AC and Validation Method are drafted with 1:1 mapping intent.
- Initial wave index is present for downstream revalidation.

## Prompt 1

`installer/src/scanner.ts` 쪽이 최근에 느리고, 깊은 디렉토리 구조에서 스킬을 종종 놓쳐. 재귀 depth 제어와 async 스캔으로 바꾸고, 기존 스캔 결과 호환성은 깨지지 않게 해줘. `SKILL.md` 작성 가이드도 같이 업데이트하고 테스트까지 한 번에 정리해줘. 우선순위는 네가 잡아줘.

### Expected Ticket Sequence

1. `scanner-async/1` `Feature` - Add recursive depth-aware skill scanning. (status: Provisional)
2. `scanner-async/2` `Refactoring` - Convert scanner flow from sync I/O to async traversal. (depends_on: scanner-async/1, status: Provisional)
3. `scanner-async/3` `Documentation` - Update scanner behavior and usage guidance in SKILL-related docs. (depends_on: scanner-async/1, scanner-async/2, status: Provisional)
4. `scanner-async/4` `Test` - Add/adjust tests for deep path detection and async behavior stability. (depends_on: scanner-async/1, scanner-async/2, status: Provisional)

## Prompt 2

`auditing-behaviors`와 `ticketing` 역할이 사용자 입장에서 겹쳐 보여. 실행 진입점은 하나처럼 보이게 하고 싶고, 기존에 `audit-behavior` 명령 쓰던 사용자도 깨지지 않았으면 해. README, installer 테스트, Gemini command, migration 안내까지 어디를 자동화할지 포함해서 설계부터 작업 단위로 쪼개줘.

### Expected Ticket Sequence

1. `skill-unification/1` `Feature` - Define and implement a unified command entrypoint behavior. (status: Provisional)
2. `skill-unification/2` `Refactoring` - Restructure overlapping skill boundaries and command routing logic. (depends_on: skill-unification/1, status: Provisional)
3. `skill-unification/3` `Improvement` - Introduce compatibility/migration strategy for existing `audit-behavior` users. (depends_on: skill-unification/1, skill-unification/2, status: Provisional)
4. `skill-unification/4` `Documentation` - Update README and migration guidance. (depends_on: skill-unification/1, skill-unification/2, skill-unification/3, status: Provisional)
5. `skill-unification/5` `Test` - Add installer/command compatibility tests for legacy and new paths. (depends_on: skill-unification/1, skill-unification/2, status: Provisional)

## Prompt 3

`{{tool.*}}` placeholder 품질을 더 강하게 관리하고 싶어. 새 키가 생기면 `installer/platforms.yaml` 매핑 누락이 절대 발생하지 않게 하고, 본문에 placeholder가 남아 있으면 빌드 전에 잡고 싶어. 다만 개발자 경험이 과하게 빡세지 않게 하고, 기존 skill이 한 번에 다 깨지는 방식은 피하고 싶어. 단계적 적용안까지 포함해서 티켓으로 나눠줘.

### Expected Ticket Sequence

1. `placeholder-governance/1` `Feature` - Add placeholder mapping completeness validation. (status: Provisional)
2. `placeholder-governance/2` `Refactoring` - Integrate placeholder residue checks into transform/pipeline flow. (depends_on: placeholder-governance/1, status: Provisional)
3. `placeholder-governance/3` `Improvement` - Add staged enforcement mode to avoid abrupt breakage. (depends_on: placeholder-governance/1, placeholder-governance/2, status: Provisional)
4. `placeholder-governance/4` `Documentation` - Document placeholder governance and rollout policy. (depends_on: placeholder-governance/1, placeholder-governance/2, placeholder-governance/3, status: Provisional)
5. `placeholder-governance/5` `Test` - Add regression tests for missing mapping and unresolved placeholder cases. (depends_on: placeholder-governance/1, placeholder-governance/2, status: Provisional)

## Prompt 4

`node installer/dist/index.js --all` 실행 시 스킬 수가 늘어나면 시간이 길어질 것 같아. 스캔/변환/설치 단계를 병렬화하거나 캐시를 넣고 싶은데, 로그 가독성과 실패 원인 추적성은 유지되어야 해. 플랫폼별 부작용(예: Gemini settings patch) 안전성도 필요해. 기능/리팩토링/문서/테스트 관점으로 티켓 분해해줘.

### Expected Ticket Sequence

1. `installer-perf/1` `Feature` - Add parallelization and/or caching strategy for `--all` pipeline. (status: Provisional)
2. `installer-perf/2` `Refactoring` - Rework execution orchestration to preserve deterministic logging and failure tracing. (depends_on: installer-perf/1, status: Provisional)
3. `installer-perf/3` `Documentation` - Update operational guidance for performance mode and failure analysis. (depends_on: installer-perf/1, installer-perf/2, status: Provisional)
4. `installer-perf/4` `Test` - Add tests for speed-path correctness, side-effect safety, and log traceability. (depends_on: installer-perf/1, installer-perf/2, status: Provisional)

## Prompt 5

에이전트 frontmatter(`profile + tools`)가 잘못되어도 지금은 늦게 발견되는 경우가 있어. 스캔 단계에서 더 빠르게 검증하고, 에러 메시지도 작성자가 바로 수정할 수 있게 바꾸고 싶어. 동시에 legacy `platforms:` 포맷은 당분간 유지해야 해. 최소 리스크로 출시하려면 어떤 티켓 순서가 좋은지, 각 티켓 완료 기준까지 포함해서 작성해줘.

### Expected Ticket Sequence

1. `frontmatter-validation/1` `Feature` - Add early frontmatter validation during scanning. (status: Provisional)
2. `frontmatter-validation/2` `Refactoring` - Unify validation pipeline for `profile+tools` and legacy `platforms:` paths. (depends_on: frontmatter-validation/1, status: Provisional)
3. `frontmatter-validation/3` `Improvement` - Improve human-actionable error messaging and remediation hints. (depends_on: frontmatter-validation/1, frontmatter-validation/2, status: Provisional)
4. `frontmatter-validation/4` `Documentation` - Update authoring conventions for agent frontmatter. (depends_on: frontmatter-validation/1, frontmatter-validation/2, frontmatter-validation/3, status: Provisional)
5. `frontmatter-validation/5` `Test` - Add validation tests covering both modern and legacy formats. (depends_on: frontmatter-validation/1, frontmatter-validation/2, status: Provisional)
