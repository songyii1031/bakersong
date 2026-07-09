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

-- updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_set_updated_at
  before update on recipes
  for each row execute function set_updated_at();

-- ================================
-- Storage: recipe-photos (private)
-- 업로드 경로: {user_id}/{recipe_id}/{uuid}.webp
-- 조회: signed URL 또는 로그인 세션 기반(RLS)
-- ================================
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', false)
on conflict (id) do nothing;

create policy "own recipe photos read" on storage.objects
  for select using (
    bucket_id = 'recipe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own recipe photos insert" on storage.objects
  for insert with check (
    bucket_id = 'recipe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own recipe photos update" on storage.objects
  for update using (
    bucket_id = 'recipe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own recipe photos delete" on storage.objects
  for delete using (
    bucket_id = 'recipe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
