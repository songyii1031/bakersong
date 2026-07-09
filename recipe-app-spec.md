# 나만의 레시피북 — 개발 작업 지시서

개인용 레시피 기록 웹앱을 개발한다. 아래 명세를 그대로 따르되, 불명확한 부분은 구현 전에 질문할 것.

---

## 1. 프로젝트 개요

- **서비스명(가칭)**: 레시피북
- **사용자**: 1인 (개인 기록용). 회원가입 기능 없음. 단일 계정 로그인만 존재
- **핵심 기능**: 레시피 등록/수정/삭제, 사진 업로드(대표 + 단계별), 재료/카테고리 검색, 즐겨찾기, 평점, 요리 과정 단계별 기록
- **사용 환경**: 모바일 우선(스마트폰 브라우저), 데스크톱은 반응형으로 대응

## 2. 기술 스택

- **프레임워크**: Next.js 14+ (App Router, TypeScript)
- **스타일**: Tailwind CSS
- **DB/스토리지/인증**: Supabase (무료 플랜)
- **배포**: Vercel
- **애니메이션**: CSS transition 위주. 라이브러리 추가 금지 (framer-motion 불필요)

환경 변수는 `.env.local`에 다음 키로 관리한다:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.local.example` 파일을 만들어 커밋하고, 실제 값 입력은 사용자(개발자 본인)가 한다.

## 3. DB 스키마

Supabase SQL Editor에서 실행할 마이그레이션 파일을 `supabase/migrations/001_init.sql`로 생성한다.

```sql
-- 레시피
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null,
  category text not null default '기타',
  cook_time int,                      -- 분 단위
  servings int,                       -- 인분
  rating numeric(2,1) default 0,      -- 0.0 ~ 5.0
  is_favorite boolean default false,
  memo text,
  main_photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 재료 (검색을 위해 별도 테이블)
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  name text not null,
  amount text,                        -- "2큰술", "300g" 등 자유 입력
  sort_order int not null default 0
);

-- 요리 단계
create table steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  step_no int not null,
  description text not null,
  photo_url text
);

-- 인덱스
create index idx_ingredients_recipe on ingredients(recipe_id);
create index idx_steps_recipe on steps(recipe_id);
create index idx_recipes_category on recipes(category);

-- RLS: 본인 데이터만 접근
alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table steps enable row level security;

create policy "own recipes" on recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own ingredients" on ingredients
  for all using (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()));

create policy "own steps" on steps
  for all using (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()));
```

**Storage**: `recipe-photos` 버킷을 private으로 생성. 업로드 경로는 `{user_id}/{recipe_id}/{uuid}.webp`. 조회는 signed URL 또는 로그인 세션 기반으로 처리. 버킷 정책도 마이그레이션 파일 또는 README에 SQL로 명시할 것.

**카테고리**: DB 테이블 없이 상수로 관리한다. `lib/constants.ts`에 정의:
`['한식', '양식', '중식', '일식', '디저트', '간식', '음료', '기타']`

## 4. 인증

- Supabase Auth 이메일+비밀번호 로그인. 회원가입 UI는 만들지 않는다 (계정은 Supabase 대시보드에서 수동 생성)
- 로그인 페이지(`/login`) 하나만 구현. 로그인하지 않으면 모든 페이지에서 `/login`으로 리다이렉트 (middleware 사용)
- 세션 유지 기간은 최대한 길게 설정 (개인 기기에서만 사용)

## 5. 디자인 시스템 — 반드시 준수

컨셉: **"오븐에서 갓 꺼낸 쿠키"**. 만화풍의 아기자기한 파스텔 핑크 톤 + 게임 UI 스타일의 입체감.

### 5.1 컬러 (Tailwind config에 커스텀 토큰으로 등록)

| 토큰명 | HEX | 용도 |
|---|---|---|
| `cream` | #FFF6F0 | 페이지 배경 (순백 #FFF 사용 금지) |
| `pink-soft` | #FBEAF0 | 연핑크 면, 비활성 배경 |
| `pink-sub` | #F4C0D1 | 보조 핑크, 테두리 |
| `pink-point` | #D4537E | 포인트(버튼, 활성 상태 전용 — 남용 금지) |
| `pink-deep` | #993556 | 보조 텍스트, 버튼 그림자 받침 |
| `beige-cookie` | #F5C4B3 | 사진 placeholder, 서브 면 |
| `brown-text` | #4B1528 | 기본 텍스트 (검정 #000 사용 금지) |
| `card-shadow` | #F3D3DF | 카드 하단 받침 그림자 |

### 5.2 폰트 (Google Fonts, next/font 사용)

- 제목/버튼/강조: **Jua**
- 본문: **Gowun Dodum**

### 5.3 형태

- 카드 radius 18px, 버튼·칩·검색바는 완전 pill (`rounded-full`)
- 테두리는 회색이 아닌 연핑크 계열 1.5~2px
- 그림자 색은 회색/검정 금지. 같은 계열의 진한 핑크·버건디 사용

### 5.4 입체감 규칙 (hard offset shadow)

```css
/* 튀어나오는 요소 — 카드 */
box-shadow: 0 5px 0 #F3D3DF, 0 8px 16px rgba(75,21,40,0.08);

/* 튀어나오는 요소 — 버튼/칩 */
box-shadow: 0 3px 0 #993556, inset 0 2px 2px rgba(255,255,255,0.4);

/* 버튼 누름 인터랙션 (필수) */
.btn:active { transform: translateY(3px); box-shadow: 0 0 0 #993556; }

/* 파여 있는 요소 — 검색바, 입력 필드 */
box-shadow: inset 0 2px 4px rgba(212,83,126,0.12);
```

원칙: 눌러서 동작하는 것은 아래 받침을 주고, 입력하는 곳은 안으로 파는다. 모든 버튼에 `:active` 눌림 효과를 적용한다.

### 5.5 기타

- 아이콘: lucide-react 아웃라인 아이콘 사용
- 실제 음식 사진은 모서리 크게 라운드 처리하고 연핑크 카드 배경 위에 배치
- 사진 없는 레시피는 카테고리별 아이콘 + 파스텔 배경 placeholder로 표시
- 빈 상태/추가 버튼 등에는 점선 테두리(`2px dashed`) + 말랑한 문구 사용 (예: "새 레시피 굽기")

## 6. 화면별 요구사항

### 6.1 홈 — 레시피 목록 (`/`)

- 상단: 앱 타이틀 + 인사 문구, 검색바(탭하면 `/search`로 이동), 카테고리 필터 칩(가로 스크롤)
- 본문: 2열 카드 그리드. 카드 = 대표사진(또는 placeholder) + 제목 + 조리시간 + 평점. 사진 우상단에 즐겨찾기 하트 토글 버튼
- 그리드 마지막에 "새 레시피 굽기" 점선 카드 (→ `/recipes/new`)
- 카테고리 칩 선택 시 클라이언트 필터링, "즐겨찾기만 보기" 토글 제공
- 하단 고정 탭바: 홈 / 검색 / 찜 / 설정 (찜 = 즐겨찾기 필터가 켜진 홈)

### 6.2 레시피 상세 (`/recipes/[id]`)

- 대표 사진(풀폭), 제목, 카테고리 뱃지, 조리시간, 인분, 평점(별 5개 탭으로 수정 가능), 즐겨찾기 토글
- 재료 목록: "이름 — 양" 형태의 리스트, 각 행에 체크박스(장보기/준비 확인용, 상태 저장 불필요)
- 요리 단계: 단계 번호 + 설명 + 사진(있을 때만). 세로 타임라인 형태
- 메모 섹션
- 우상단 수정 버튼(→ `/recipes/[id]/edit`), 수정 화면 안에 삭제 버튼(confirm 모달 필수)

### 6.3 등록/수정 (`/recipes/new`, `/recipes/[id]/edit`)

단일 페이지 폼. 섹션 순서:

1. **기본 정보**: 제목(필수), 카테고리(칩 선택), 조리시간, 인분, 대표 사진 업로드
2. **재료**: 이름 + 양 2칸 입력 행. "재료 추가" 버튼으로 행 추가, 행별 삭제 버튼, 드래그 정렬은 불필요 (sort_order는 입력 순서)
3. **요리 단계**: 설명 textarea + 사진 업로드(선택). "단계 추가"로 행 추가, 행별 삭제
4. **메모** (선택)

- 저장 시 recipes → ingredients → steps 순서로 저장. 수정 시 ingredients/steps는 delete 후 재삽입 방식으로 단순화
- **이미지 업로드 규칙(중요)**: 업로드 전 클라이언트에서 리사이징 — 최대 폭 1200px, webp 변환, 품질 0.8. `browser-image-compression` 라이브러리 사용. Supabase 무료 스토리지 1GB 절약이 목적
- 업로드 중 로딩 표시, 실패 시 토스트 메시지

### 6.4 검색 (`/search`)

- 검색 입력창에 자동 포커스
- **레시피 제목 + 재료 이름** 양쪽에서 검색. 예: "두부" 검색 시 두부가 재료로 들어간 레시피도 나와야 함
- Supabase 쿼리: recipes.title ilike 검색과 ingredients.name ilike 검색 결과를 합쳐 중복 제거
- 결과는 홈과 동일한 카드 그리드. 결과 없으면 귀여운 빈 상태 문구

### 6.5 설정 (`/settings`)

- 로그아웃 버튼만 있으면 됨 (추후 확장용 자리)

## 7. 개발 단계 — 이 순서대로 진행하고 단계마다 확인받을 것

**Phase 1 (MVP)**
1. 프로젝트 셋업: Next.js + Tailwind + Supabase 클라이언트 + 디자인 토큰 등록
2. 마이그레이션 SQL 작성, 로그인/미들웨어
3. 레시피 등록(대표 사진 1장만) → 홈 목록 → 상세 → 수정/삭제

**Phase 2**
4. 재료/단계 입력 UI 고도화, 단계별 사진 업로드
5. 검색(제목+재료), 카테고리 필터

**Phase 3**
6. 즐겨찾기, 평점, 찜 탭
7. 이미지 리사이징 최적화, 로딩/빈 상태/에러 처리 다듬기

## 8. 폴더 구조 (제안)

```
app/
  (auth)/login/page.tsx
  page.tsx                  # 홈
  search/page.tsx
  settings/page.tsx
  recipes/new/page.tsx
  recipes/[id]/page.tsx
  recipes/[id]/edit/page.tsx
components/
  RecipeCard.tsx
  CategoryChips.tsx
  StarRating.tsx
  FavoriteButton.tsx
  PhotoUploader.tsx
  IngredientRows.tsx
  StepRows.tsx
  BottomTabBar.tsx
lib/
  supabase/client.ts
  supabase/server.ts
  constants.ts
  image.ts                  # 리사이징 유틸
supabase/
  migrations/001_init.sql
```

## 9. 주의사항

- 모바일 우선. 뷰포트 375px 기준으로 먼저 만들고 데스크톱은 max-width 640px 중앙 정렬로 처리
- `100vh` 대신 `100dvh` 사용, iOS safe area inset 대응 (`env(safe-area-inset-bottom)` — 하단 탭바에 필수)
- 폼 입력 필드 font-size는 16px 이상 (iOS 자동 확대 방지)
- 서버 컴포넌트 우선, 인터랙션 필요한 곳만 클라이언트 컴포넌트
- 커밋은 Phase 내 작업 단위별로 쪼개서 진행
- 라이브러리 추가는 명시된 것 외 금지 (추가가 필요하면 이유를 설명하고 승인받을 것)
