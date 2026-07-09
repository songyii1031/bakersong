-- 텍스트 블록 서식 (정렬 / 글자 크기 / 굵기 / 배경색)
alter table content_blocks add column text_align text not null default 'left'
  check (text_align in ('left', 'center', 'right'));
alter table content_blocks add column font_size text not null default 'md'
  check (font_size in ('sm', 'md', 'lg'));
alter table content_blocks add column bold boolean not null default false;
alter table content_blocks add column bg_color text
  check (bg_color is null or bg_color in ('pink-soft', 'pink-sub', 'beige-cookie'));
