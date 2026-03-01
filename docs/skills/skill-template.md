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
  - 번호/상태값 유효 목록
- 상태/결정형 스킬:
  - 상태 전이 규칙(예: Proposed → Accepted 등)
- 상호작용형 스킬:
  - 사용자 확인 포인트를 명확히 표기
  - 다른 스킬 호출이 있으면 호출 조건·대상·예상 산출물·실패시 처리 순서 명시

## 2) 문서 품질 규칙

- 명령형 문체 사용: `Check`, `Verify`, `Create`, `Run`, `Report`
- 모호한 조건 회피
- 실무에서 재현 가능한 검증 포인트 명시
- 장문보다 최소 실무 단위 예시 위주 작성

## 4) 코드블록 사용 규칙

- 실행 명령: ` ```bash`
- 정책/알고리즘: ` ```text`
- 템플릿/산출물: ` ```markdown`

## 5) 체크리스트 (작성 완료 직전)

- [ ] frontmatter와 제목 존재
- [ ] 목적/동작이 명확
- [ ] 실행형이면 `Process`와 단계가 있는지 확인
- [ ] 위험/완료형이면 철칙(Iron Law) 또는 Guardrail 존재
- [ ] 연계 스킬 호출 시 호출 조건이 명시
- [ ] 최소 반영 체크리스트 있음
- [ ] `프로젝트` 규칙(경로/파일명/상태)이 필요 시 반영됨

## 6) 금지 패턴

- 결과만 주장하고 실행 절차 생략
- 경로/입력 조건 없이 바로 파일 변경
- 완료 검증 없이 `완료` 선언
- 삭제/폐기/강제 변경 시 명시적 동의 부재
- 파괴적 단계 누락

## 7) 추천 특수 블록 (필요 시)

### The Iron Law

```text
## The Iron Law
- [비교가 불가능할 만큼 핵심인 제약 규칙 1개]
```

### 상태 전이

```text
## Status Transitions
Accepted -> Deprecated
Accepted -> Superseded by [NNNN](NNNN-title.md)
```

### 입력/출력 계약

```text
## Input / Output Contract
- Input: ...
- Output: ...
```

### 사용자 결정

```text
How should we proceed?
- Continue (recommended)
- Revise assumptions
- Back to research
```

### 스킬 호출

```text
When [condition]:
- Invoke "<name>" on [path]
- If failed: return to fix stage
```
