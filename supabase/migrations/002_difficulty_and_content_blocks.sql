-- 난이도
alter table recipes add column difficulty text not null default '보통';

-- 블로그 형식 본문 (텍스트/사진 블록을 순서대로 나열)
create table content_blocks (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  sort_order int not null default 0,
  block_type text not null check (block_type in ('text', 'image')),
  text_content text,
  photo_url text
);

create index idx_content_blocks_recipe on content_blocks(recipe_id);

alter table content_blocks enable row level security;

create policy "own content blocks" on content_blocks
  for all using (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()));
