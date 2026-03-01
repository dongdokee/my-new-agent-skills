# Skill Template (v2)

이 템플릿은 SKILL 문서 패턴을 반영한 최소 작성 기준입니다.

```markdown
---
name: skill-slug
description: >-
  언제/어떤 상황에서 이 스킬을 써야 하는지, 해결하는 문제를 한 문장으로.
---

# <Skill Title>
```

## Required Baseline (모든 SKILL에서 권장)

- YAML frontmatter (`name`, `description`)가 있어야 합니다.
  - `name`은 kebab-case여야 합니다.
- 제목 `# <Skill Title>`이 있어야 합니다.
- 스킬의 목적을 설명하는 핵심 섹션이 있어야 합니다.
  - `## Purpose`를 권장합니다.

## Recommended Core Sections

- `## Purpose`
- `## When to Use`
- `## When Not to Use`
- `## Process`
- `## Anti-Patterns`
- `## Integration`
- `## Checklist` 또는 `## Checklist Before/After...`

## Category-Specific Requirements

- 완료/완전성 의존 스킬:
  - `## The Iron Law`
  - `## Checklist Before Running`
  - `## Checklist Before Finishing`
- 파일 생성/수정 스킬:
  - 경로 정책(상대경로/`..` 금지/절대경로 처리)
  - 출력 패턴(예: `docs/xxx/YYYY-MM-DD-...`)
  - 파일명 규칙
  - 번호/상태값 허용 목록
- 상태/결정형 스킬:
  - 상태 전이 규칙(예: Proposed → Accepted 등)
- 상호작용형 스킬:
  - 사용자 확인 포인트를 명확히 표기
  - `AskUserQuestion` 스타일 권장
- 다단계 작업형 스킬:
  - `## Process`와 함께 `### 1.`, `### 2.` 스타일 단계 번호 권장

## Minimal Actionable Skeleton

```markdown
## Purpose

- 문제/목적

## Process

### 1. 사전 점검

- [필수 입력 확인]
- [안전 조건 확인]

### 2. 실행

- [핵심 절차]

### 3. 완료/보고

- [산출물 확인]
- [결과 요약]

## Anti-Patterns

- **잘못된 동작**: [설명]
- **올바른 대체**: [설명]
```

## Cross-Skill / Tool Invocation

다른 스킬을 호출할 경우 각 항목을 명시합니다.

- 호출 조건
- 호출 대상 (`<name>`)
- 기대 산출물(파일/결과/상태)
- 실패 시 되돌릴 경로

## Safety / Rollback

- 파괴적 동작은 사전 승인(명시적 확인) 포함
- 완료 주장 전 검증 근거를 남김
- 상태 변경이 있는 스킬은 복구 전략 제시

## Validation Block (권장)

- 입력 검증: 경로, 타입, 범위
- 출력 검증: 파일 존재, 경로 패턴 준수, 상태값 유효성
- 종료 조건: 수행 근거(명령 출력, 파일 존재, 상태 변경 확인)

## Integration

- 이전 단계
- 다음 단계
- 관련 스킬: `<skill-name>`
