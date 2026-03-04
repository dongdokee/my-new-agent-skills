# Ticketing Skill Test Prompts (General)

Use these prompts to test whether the `ticketing` skill can decompose ambiguous, mixed-scope requests into dependency-ordered tickets with quality-governed specs in a general software project context.

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

Our product search API has become slow and intermittently times out during traffic spikes. I want query optimization and caching together, but the existing response schema must stay backward compatible. Please also update operational guidance and include tests that cover high-load regression risk. Break it down into a prioritized ticket sequence.

### Expected Ticket Sequence

1. `search-performance/1` `Feature` - Introduce optimized query strategy and cache policy for search endpoints. (status: Provisional)
2. `search-performance/2` `Refactoring` - Consolidate duplicated/inefficient query paths into a single performance-focused flow. (depends_on: search-performance/1, status: Provisional)
3. `search-performance/3` `Documentation` - Update API and operations documentation for caching behavior, fallback, and compatibility guarantees. (depends_on: search-performance/1, search-performance/2, status: Provisional)
4. `search-performance/4` `Test` - Add load and regression tests for latency targets, timeout resilience, and schema compatibility. (depends_on: search-performance/1, search-performance/2, status: Provisional)

## Prompt 2

Our web and mobile onboarding flows are functionally similar but implemented separately, which is expensive to maintain. I want users to see one consistent experience, while keeping existing legacy signup links working. Include migration guidance, documentation updates, and test automation scope in the decomposition.

### Expected Ticket Sequence

1. `onboarding-unification/1` `Feature` - Define and implement a unified onboarding behavior across web and mobile. (status: Provisional)
2. `onboarding-unification/2` `Refactoring` - Extract duplicated onboarding logic into shared components/services. (depends_on: onboarding-unification/1, status: Provisional)
3. `onboarding-unification/3` `Improvement` - Add backward-compatible routing and migration handling for legacy signup links. (depends_on: onboarding-unification/1, onboarding-unification/2, status: Provisional)
4. `onboarding-unification/4` `Documentation` - Update product and engineering docs with migration guidance. (depends_on: onboarding-unification/1, onboarding-unification/2, onboarding-unification/3, status: Provisional)
5. `onboarding-unification/5` `Test` - Add end-to-end and compatibility tests for legacy and unified onboarding paths. (depends_on: onboarding-unification/1, onboarding-unification/2, status: Provisional)

## Prompt 3

I want stronger governance for template placeholders (`{{variable.*}}`). When a new key is introduced, missing environment mappings should be detected reliably, and unresolved placeholders should fail before release. At the same time, developer experience should stay reasonable, and existing templates should not break abruptly. Include a staged rollout approach.

### Expected Ticket Sequence

1. `template-governance/1` `Feature` - Add completeness validation for template variable mappings. (status: Provisional)
2. `template-governance/2` `Refactoring` - Integrate unresolved-placeholder checks into rendering/build pipeline stages. (depends_on: template-governance/1, status: Provisional)
3. `template-governance/3` `Improvement` - Introduce staged enforcement modes to reduce adoption risk. (depends_on: template-governance/1, template-governance/2, status: Provisional)
4. `template-governance/4` `Documentation` - Document placeholder governance rules and rollout policy. (depends_on: template-governance/1, template-governance/2, template-governance/3, status: Provisional)
5. `template-governance/5` `Test` - Add regression tests for missing mappings and unresolved placeholders. (depends_on: template-governance/1, template-governance/2, status: Provisional)

## Prompt 4

`batch import --all` takes too long as dataset size grows. I want to consider parallelism and caching across parse/transform/store stages, but keep logs readable and failures easy to trace. Side effects like external sync operations also need to remain safe. Decompose this into feature/refactoring/test/documentation tickets.

### Expected Ticket Sequence

1. `batch-processing/1` `Feature` - Add parallelization and/or caching strategy for bulk processing. (status: Provisional)
2. `batch-processing/2` `Refactoring` - Rework orchestration to preserve deterministic logging and failure tracing. (depends_on: batch-processing/1, status: Provisional)
3. `batch-processing/3` `Documentation` - Update operational guidance for performance mode and incident analysis. (depends_on: batch-processing/1, batch-processing/2, status: Provisional)
4. `batch-processing/4` `Test` - Add tests for throughput-path correctness, side-effect safety, and log traceability. (depends_on: batch-processing/1, batch-processing/2, status: Provisional)

## Prompt 5

Configuration metadata (`profile + capabilities`) errors are currently discovered too late in the release cycle. I want earlier validation during initial loading and more actionable error messages so developers can fix issues quickly. We still need temporary support for a legacy `platforms:` format. Propose a low-risk ticket order with clear completion criteria.

### Expected Ticket Sequence

1. `metadata-validation/1` `Feature` - Add early metadata validation during initial loading. (status: Provisional)
2. `metadata-validation/2` `Refactoring` - Unify validation paths for modern (`profile+capabilities`) and legacy (`platforms:`) formats. (depends_on: metadata-validation/1, status: Provisional)
3. `metadata-validation/3` `Improvement` - Improve actionable error messaging and remediation hints. (depends_on: metadata-validation/1, metadata-validation/2, status: Provisional)
4. `metadata-validation/4` `Documentation` - Update authoring conventions for metadata schemas. (depends_on: metadata-validation/1, metadata-validation/2, metadata-validation/3, status: Provisional)
5. `metadata-validation/5` `Test` - Add validation tests covering both modern and legacy formats. (depends_on: metadata-validation/1, metadata-validation/2, status: Provisional)
