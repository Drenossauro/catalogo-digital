-- Categorias
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz default now()
);

-- Produtos
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10,2) not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  image_url   text,
  active      boolean not null default true,
  created_at  timestamptz default now()
);

-- Índices
create index on public.products (active);
create index on public.products (category_id);

-- RLS: catálogo público pode ler produtos ativos e categorias
alter table public.products   enable row level security;
alter table public.categories enable row level security;

create policy "Público lê produtos ativos"
  on public.products for select
  using (active = true);

create policy "Admin gerencia produtos"
  on public.products for all
  using (auth.role() = 'authenticated');

create policy "Público lê categorias"
  on public.categories for select
  using (true);

create policy "Admin gerencia categorias"
  on public.categories for all
  using (auth.role() = 'authenticated');

-- Storage bucket para imagens
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Imagens públicas legíveis"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin faz upload de imagens"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admin deleta imagens"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Dados iniciais de exemplo
insert into public.categories (name, slug) values
  ('Anéis', 'aneis'),
  ('Colares', 'colares'),
  ('Pulseiras', 'pulseiras'),
  ('Brincos', 'brincos');
