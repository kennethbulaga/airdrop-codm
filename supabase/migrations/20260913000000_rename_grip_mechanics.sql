-- Update presets grip check constraint to use clean 'Finger' names without 'Thumbs' or 'Claw'
BEGIN;

UPDATE presets SET grip = '2-Finger' WHERE grip = '2-Finger Thumbs';
UPDATE presets SET grip = '4-Finger' WHERE grip = '4-Finger Claw';

ALTER TABLE presets DROP CONSTRAINT IF EXISTS presets_grip_check;
ALTER TABLE presets ADD CONSTRAINT presets_grip_check 
  CHECK (grip IS NULL OR grip = ANY (ARRAY['2-Finger'::text, '3-Finger'::text, '4-Finger'::text, '5+ Finger'::text]));

COMMIT;
