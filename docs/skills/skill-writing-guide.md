# Skill Authoring Guide

`SKILL.md`를 새로 만들 때 기준입니다.

## 1) 최소 요구사항 (필수)

1. 파일 최상단 YAML frontmatter
   - `name: <kebab-case-slug>`
   - `description:` (단일 라인 문자열 또는 블록 스칼라 `>-` 모두 허용)
2. 사용자에게 보일 `#` 제목
3. 스킬 목적/동작이 드러나는 핵심 섹션 1개 이상
   - `## Purpose` 또는 `## Process` 또는 동치 섹션
4. 문서가 실행형이면 최소한 다음 중 하나가 있어야 함
   - `## Process` 또는 `## Workflow`
   - 단계는 `### 1.` 형태를 권장
5. 파괴적/완료형 스킬은 근거형 체크포인트와 안전성 문구 포함
   - 예: `The Iron Law`, `Checklist`, `Safety / Guardrails`

## 2) 권장 구성 (범용)

- `## Purpose`
- `## When to Use` (가능하면 `When Not to Use`도)
- `## Process`  
- `## Anti-Patterns`
- `## Integration` 또는 `Integration with ...`
- `## Safety / Guardrails` 또는 `## Safety`/`## Rollback`
- `## Checklist` 또는 `## Checklist Before...` / `## Checklist Before Finishing`
- 마크다운 결과 검증이 필요한 경우 `## Markdown Validation` 또는 `## Validation`

## 2-1) 스킬 유형별 확장 규칙

### 실행형 스킬

- `## Process`
- 단계 번호 `### 1.`부터 시작
- 입력/출력이 있는 경우 계약 섹션 추가

### 결정/문서화형 스킬

- 의사결정 경계가 있으면 `## The Iron Law` 추가
- 상태 전이가 있으면 `## Status Transitions` 또는 동등 블록

### 파일 생성/변경형 스킬

- 파일 경로 정책: 상대경로 허용/절대경로/`..` 금지
- 출력 경로 패턴
- 파일명 규칙(번호/포맷)
- 상태/열거형 값의 유효 목록

### 검증형 스킬

- 근거 없는 완료 금지
- `## Evidence / Verification Gate` 또는 체크리스트에서 증거 항목을 명시

### 연계형/상호작용형 스킬

- `AskUserQuestion` 형태의 선택지 표기
- 다른 스킬 호출이 있으면 호출 조건·대상·예상 산출물·실패시 처리 순서 명시

## 3) 문서 품질 규칙

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
