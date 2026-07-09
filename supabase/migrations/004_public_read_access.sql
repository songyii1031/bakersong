-- 게스트 열람 기능: 로그인 없이도 레시피를 읽을 수 있도록 공개 조회 정책 추가.
-- 쓰기(insert/update/delete)는 기존 "own ..." 정책이 그대로 담당하므로 주인 계정만 가능.
create policy "public read recipes" on recipes
  for select using (true);

create policy "public read ingredients" on ingredients
  for select using (true);

create policy "public read steps" on steps
  for select using (true);

create policy "public read content blocks" on content_blocks
  for select using (true);

create policy "public read recipe photos" on storage.objects
  for select using (bucket_id = 'recipe-photos');
