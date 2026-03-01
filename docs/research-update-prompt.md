# 새 대화에서 사용할 프롬프트

다음 작업만 수행해줘.

목표: `skills/mapping-task-tools/SKILL.md`만 수정해서, `skills/research/SKILL.md` 실행 시 `update_plan`의 6개 `step` 문자열과 1:1로 매핑되도록 규칙화한다.

## 작업 범위
- **수정 파일: `skills/mapping-task-tools/SKILL.md` 단일 파일만**
- `skills/research/SKILL.md` 본문은 직접 수정하지 않는다.

## 반영 조건
1) `skills/mapping-task-tools/SKILL.md`에 Codex 맵핑 규칙을 추가해서 아래 Step이 `update_plan`에서 고정으로 사용되도록 정의한다.
- `Step 1: Intent Interrogation`
- `Step 2: Preliminary Requirements`
- `Step 3: Targeted Exploration`
- `Step 4: Design Synthesis`
- `Step 5: Validated Requirements and Final Design Freeze`
- `Step 6: Ticket Authoring`

2) 기존 설명에 다음 제약을 반드시 포함한다.
- `update_plan`는 항상 전체 plan 배열을 한 번에 전달한다(부분 업데이트 금지)
- `in_progress`는 한 번에 하나만 허용
- 위 6개 Step 문자열은 허용 Step 목록으로 고정
- 다음 Step로 순차 진행할 때 상태 전이 예시를 넣는다.

3) `research`가 실행되는 동안 각 단계 시작/완료 시 매핑 규칙을 적용하는 템플릿을 `mapping-task-tools/SKILL.md`에 추가한다.
- 시작: 이전 단계 completed, 현재 단계 in_progress
- 거절/수정 루프에서 되돌릴 때의 단계 전이 규칙(예: freeze 거절 시 Step 2 또는 Step 4로 되돌림)

4) 변경은 `skills/mapping-task-tools/SKILL.md` 내부의 “when using Codex” 섹션이나 동등한 부분에만 넣는다.

## 최종 확인
- `skills/research/SKILL.md`를 수정하지 않아도 `update_plan`에 위 6개 Step이 자동 정합성 있게 사용될 수 있어야 한다.
- 문서가 과도하게 길어지지 않게 실무 규칙형으로 간결하게 정리한다.
