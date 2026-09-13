-- Migration: Add graphic_quality column to public.presets
-- Target: Low, Medium, High, Very High (Official CODM BR Graphic Quality options)

alter table public.presets 
add column if not exists graphic_quality text;

-- Add check constraint for valid graphic quality values
alter table public.presets 
drop constraint if exists presets_graphic_quality_check;

alter table public.presets 
add constraint presets_graphic_quality_check 
check (graphic_quality is null or graphic_quality in ('Low', 'Medium', 'High', 'Very High'));

-- Create index for fast filtering on graphic quality
create index if not exists idx_presets_graphic_quality on public.presets(graphic_quality);
