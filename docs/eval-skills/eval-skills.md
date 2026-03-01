# Agent Skill 평가 가이드 정리

이 문서는 `/.ref/agent-skills-guide/eval-skills.md` 내용을 바탕으로, Codex 스킬을 체계적으로 평가하는 방법을 간단히 정리한 것입니다.

## 1) 평가의 핵심 목표

스킬 품질은 느낌이 아니라 **측정 가능한 지표**로 판단합니다.  
평가는 `프롬프트(입력) → 실행 트레이스/아티팩트(캡처) → 검증 규칙(체크) → 점수/판단`의 구조로 진행합니다.

- 결과 목표(Outcome): 과제가 완수됐는가, 산출물이 의도대로 생성됐는가
- 과정 목표(Process): 스킬이 의도한 도구/명령/순서를 따랐는가
- 스타일 목표(Style): 출력이 팀 컨벤션/설계 규칙을 준수했는가
- 효율성 목표(Efficiency): 불필요한 반복/과도한 명령/토큰 낭비가 있었는가

## 2) 수동 검증(개발 초기): 스킬 동작 범위와 가정 점검

- `SKILL.md`의 `name`/`description`이 너무 애매하면 스킬이 안 불릴 수 있고, 과도하게 넓으면 오동작합니다.
- 직접 실행해 보며 숨은 가정을 찾습니다.
  - 트리거 가정: 어떤 프롬프트에서 스킬이 실행되어야 하는지
  - 환경 가정: 빈 폴더, npm 사용 가능 여부, 권한 등
  - 실행 가정: 필수 명령 누락(예: `npm install`) 여부
- 자동화 전단계이므로, 정밀성보다 **누락·예외 케이스 폭로**에 집중합니다.

## 3) 재현 가능한 평가 데이터셋 구성

- 소규모 CSV(처음엔 10~20개)로 시작합니다.
- 각 행은 `prompt` + `should_trigger`를 포함해, 스킬을 써야 하는지/안 써야 하는지를 검증합니다.
- 구성 예:
  - 명시적 호출(스킬 이름 직접 지정): 트리거 신뢰도 확인
  - 암시적 호출(유사 상황 서술): 설명 기반 자동 선택 동작 확인
  - 반례 케이스(should_trigger=false): 기존 프로젝트 수정 요청처럼 스킬 오탐지 방지

## 4) 결정적(granular) 체크: `codex exec --json` 기반

- 스킬 실행 시 `codex exec --json --full-auto "<prompt>"`로 JSONL 이벤트를 저장합니다.
- JSONL의 `item.*` 이벤트에서 다음을 체크합니다.
  - 특정 명령 실행 여부(예: `npm install`)
  - 파일 생성 여부(예: `package.json`)
  - 명령 순서/수량(불필요 반복·루프 탐지)
- 장점: 실패 시 **재현 가능하고 디버깅 가능한** 근거가 남음.

실행 예시:

```shell
codex exec --json --full-auto "Use the $setup-demo-app skill to create the project in this directory."
```

### 체크 항목 예시

1. `npm install`이 `command_execution` 이벤트로 실행되었는가  
2. 기대 파일 구조가 존재하는가  
3. 불필요한 명령이 과도하게 늘지 않았는가

## 5) 정성적 품질: `--output-schema` 기반 루브릭

명령/파일 존재만으로는 구조·스타일 품질을 다 잡기 어렵습니다.  
이 경우 2단계를 둡니다.

1. 스킬 실행으로 코드/구조 생성
2. 읽기 전용 점검 프롬프트를 다시 실행해 룰렛북 기반 점수화

- `--output-schema ./docs/eval-skills/scripts/style-rubric.schema.json`로 `overall_pass`, `score`, `checks[]` 같은 고정 필드를 강제해 파싱/비교 가능하게 합니다.
- 예: 기술 스택 맞춤, Tailwind 적용 방식, 컴포넌트 구조, 스타일 규약 준수 여부를 항목별로 점수화

## 6) 점검 항목 확장(성숙 단계)

- 명령 호출 수/반복(성능 저하·루프 탐지)
- 토큰 사용량(`usage.input_tokens`, `usage.output_tokens`) 추이
- 빌드/실행 체크(`npm run build`, 필요 시 `npm run dev` smoke test)
- 저장소 정리 상태(`git status --porcelain` 허용 목록)
- 샌드박스 권한 수준(필요 최소 권한 유지되는지)

## 7) 운영상 권장 순서

1. 스킬 정의(특히 name/description)와 성공 기준 확정  
2. 수동 실행으로 트리거/환경 가정 점검  
3. 작은 CSV로 명시적/암시적/반례 케이스 포함한 기본 회귀군 구축  
4. `--json` 기반 결정적 체크로 회귀를 자동 감지  
5. 필요 시 `--output-schema`로 스타일/규약을 정성 채점  
6. 신규 실패 케이스를 데이터셋에 추가해 회귀 방지 고정화

## 정리

스킬 평가는 “느낌”이 아니라,  
`실행 근거가 있는 체크(결정적)`와 `규칙이 어려운 품질 요건(루브릭)`을 함께 쓰면 가장 안정적입니다.

## 부록: 적용 예시

아래는 실제로 바로 붙여서 쓸 수 있는 최소 예시입니다.

### A. 프롬프트 집합(CSV)

- 위치: `docs/eval-skills/scripts/setup-demo-app.prompts.csv`

```csv
- id,should_trigger,prompt
test-01,true,"Create a demo app named `devday-demo` using the $setup-demo-app skill"
test-02,true,"Set up a minimal React demo app with Tailwind for quick UI experiments"
test-03,true,"Create a small demo app to showcase the Responses API"
test-04,false,"Add Tailwind styling to my existing React app"
```

### B. `--json` 실행 + Deterministic 체크 예시 (Node.js)

- 위치: `docs/eval-skills/scripts/run-setup-demo-app-evals.mjs`
- `setup-demo-app.prompts.csv`의 모든 케이스를 순차 실행
- 각 케이스의 `codex exec --json --full-auto` trace를 `docs/eval-skills/artifacts/runs/<id>/trace.jsonl`에 저장
- 결정적 체크: `npm install` 실행 여부, 스캐폴딩 명령 검출, command count
- `should_trigger=true`인 케이스에서만 `package.json` 후보 루트에 대해 `npm run build` 실행
- `command_count`가 임계치(80) 초과 시 실패 처리(루프/과도한 반복 탐지)
- `should_trigger=false` 케이스는 오탐지 여부를 음성(negative) 판정
- 모든 결과를 `docs/eval-skills/artifacts/eval-summary.json`로 집계

실행 예시:

```shell
node docs/eval-skills/scripts/run-setup-demo-app-evals.mjs
```

요약 결과 확인:

```shell
cat docs/eval-skills/artifacts/eval-summary.json
```

### C. 스타일/규약 정성 채점 스키마

- 위치: `docs/eval-skills/scripts/style-rubric.schema.json`

```json
{
  "type": "object",
  "properties": {
    "overall_pass": { "type": "boolean" },
    "score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "checks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "pass": { "type": "boolean" },
          "notes": { "type": "string" }
        },
        "required": ["id", "pass", "notes"],
        "additionalProperties": false
      }
    }
  },
  "required": ["overall_pass", "score", "checks"],
  "additionalProperties": false
}
```

### D. `--output-schema`를 쓰는 검사 프롬프트 예시

```shell
codex exec \
  "Evaluate the demo-app repository against these requirements:\n   - Vite + React + TypeScript project exists\n   - Tailwind is configured via @tailwindcss/vite and CSS imports tailwindcss\n   - src/components contains Header.tsx and Card.tsx\n   - Components are functional and styled with Tailwind utility classes (no CSS modules)\n   Return a rubric result as JSON with check ids: vite, tailwind, structure, style." \
  --output-schema ./docs/eval-skills/scripts/style-rubric.schema.json \
  -o ./docs/eval-skills/artifacts/test-01.style.json
```
### E. 스타일 루브릭 + 통합 실행 예시

- 위치: `docs/eval-skills/scripts/run-setup-demo-style-evals.mjs`
  - `docs/eval-skills/artifacts/eval-summary.json`을 읽어서 `should_trigger=true` 케이스만 루브릭 점검
  - 결과: `docs/eval-skills/artifacts/eval-summary.with-style.json`
- 위치: `docs/eval-skills/scripts/run-setup-demo-all-evals.mjs`
  - 위 2개 실행기를 순차 실행해서 통합 결과 생성
  - 결과: `docs/eval-skills/artifacts/combined-eval-summary.json`

실행 예시:

```shell
node docs/eval-skills/scripts/run-setup-demo-all-evals.mjs
```

요약 파일 확인:

```shell
cat docs/eval-skills/artifacts/eval-summary.with-style.json
cat docs/eval-skills/artifacts/combined-eval-summary.json
```
