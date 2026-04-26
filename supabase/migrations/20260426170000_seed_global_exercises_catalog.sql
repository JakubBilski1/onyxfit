-- Idempotent expansion of the global exercise catalog.
-- 32 existing rows are preserved; this only inserts names that aren't already
-- present (case-insensitive) under source='global' or 'wger'.

CREATE UNIQUE INDEX IF NOT EXISTS exercises_global_name_uniq
  ON public.exercises (lower(name))
  WHERE source IN ('global', 'wger');

WITH new_exercises(name, primary_muscle, secondary_muscles, equipment, category, cues) AS (
  VALUES
    -- CHEST
    ('Push-Up', 'chest', ARRAY['triceps','shoulders','core'], 'bodyweight', 'compound', 'Tight core, full lockout, chest grazes the floor.'),
    ('Diamond Push-Up', 'triceps', ARRAY['chest'], 'bodyweight', 'compound', 'Index fingers and thumbs touch; elbows close.'),
    ('Decline Push-Up', 'chest', ARRAY['triceps','shoulders'], 'bodyweight', 'compound', 'Feet elevated; emphasises upper chest.'),
    ('Dumbbell Bench Press', 'chest', ARRAY['triceps','shoulders'], 'dumbbell', 'compound', 'Wrists stacked, elbows ~45°.'),
    ('Incline Bench Press', 'chest', ARRAY['triceps','shoulders'], 'barbell', 'compound', '30-45° bench, bar to upper chest.'),
    ('Decline Bench Press', 'chest', ARRAY['triceps'], 'barbell', 'compound', 'Lower chest emphasis; tight arch.'),
    ('Decline Dumbbell Press', 'chest', ARRAY['triceps'], 'dumbbell', 'compound', 'Lower-pec bias; controlled descent.'),
    ('Machine Chest Press', 'chest', ARRAY['triceps','shoulders'], 'machine', 'compound', 'Stable path for hypertrophy or fatigued sets.'),
    ('Pec Deck', 'chest', ARRAY[]::text[], 'machine', 'isolation', 'Squeeze in the contracted position; no jerk.'),
    ('Cable Fly (Low to High)', 'chest', ARRAY[]::text[], 'cable', 'isolation', 'Pulleys low; finish hands at chin height.'),
    ('Cable Fly (High to Low)', 'chest', ARRAY[]::text[], 'cable', 'isolation', 'Pulleys high; finish at hip line for lower chest.'),
    ('Landmine Press', 'shoulders', ARRAY['chest','triceps'], 'barbell', 'compound', 'Half-kneel or standing; stack ribs over hips.'),
    ('Svend Press', 'chest', ARRAY['shoulders'], 'plate', 'isolation', 'Press a plate forward, squeeze the pecs hard.'),

    -- BACK / LATS
    ('Sumo Deadlift', 'back', ARRAY['glutes','quadriceps','hamstrings'], 'barbell', 'compound', 'Wide stance, hips closer to bar; vertical shins.'),
    ('Trap Bar Deadlift', 'back', ARRAY['quadriceps','glutes','hamstrings'], 'barbell', 'compound', 'Neutral grip; great deadlift entry point.'),
    ('Deficit Deadlift', 'back', ARRAY['hamstrings','glutes'], 'barbell', 'compound', 'Stand on a 2-4" platform for ROM.'),
    ('Snatch-Grip Deadlift', 'back', ARRAY['hamstrings','glutes','traps'], 'barbell', 'compound', 'Wide grip, upper back works hard.'),
    ('Rack Pull', 'back', ARRAY['glutes','traps'], 'barbell', 'compound', 'Pin height just below knees; overload the lockout.'),
    ('Bent-Over Row', 'back', ARRAY['biceps','rear delts'], 'barbell', 'compound', 'Hinge ~45°, pull to navel, neutral spine.'),
    ('One-Arm Dumbbell Row', 'back', ARRAY['biceps','rear delts'], 'dumbbell', 'compound', 'Brace on bench; pull elbow toward hip.'),
    ('Seated Cable Row', 'back', ARRAY['biceps','rear delts'], 'cable', 'compound', 'Tall chest, drive elbows back, no torso rock.'),
    ('T-Bar Row', 'back', ARRAY['biceps'], 'machine', 'compound', 'Hinge with neutral spine; full retraction.'),
    ('Meadows Row', 'back', ARRAY['biceps','rear delts'], 'barbell', 'compound', 'Single-arm landmine row; staggered stance.'),
    ('Inverted Row', 'back', ARRAY['biceps','rear delts'], 'bodyweight', 'compound', 'Body straight; pull chest to bar.'),
    ('Kroc Row', 'back', ARRAY['biceps','traps'], 'dumbbell', 'compound', 'Heavy DB, controlled body english allowed.'),
    ('Chin-Up', 'back', ARRAY['biceps'], 'bodyweight', 'compound', 'Supinated grip; chest to bar.'),
    ('Neutral-Grip Pull-Up', 'back', ARRAY['biceps'], 'bodyweight', 'compound', 'Palms facing; bicep-friendly variant.'),
    ('Single-Arm Lat Pulldown', 'back', ARRAY['biceps'], 'cable', 'compound', 'Drive elbow down and back; pause at the bottom.'),
    ('Straight-Arm Pulldown', 'back', ARRAY[]::text[], 'cable', 'isolation', 'Lats only; arms stay straight, hinge slightly.'),
    ('Reverse Fly (Dumbbell)', 'rear delts', ARRAY['back'], 'dumbbell', 'isolation', 'Hinge forward; lead with the elbows.'),
    ('Shrug (Barbell)', 'traps', ARRAY[]::text[], 'barbell', 'isolation', 'Straight up, no rolling.'),
    ('Shrug (Dumbbell)', 'traps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Hold at the top for a beat.'),

    -- SHOULDERS
    ('Push Press', 'shoulders', ARRAY['triceps','quadriceps'], 'barbell', 'compound', 'Quarter-dip with the legs; drive bar overhead.'),
    ('Arnold Press', 'shoulders', ARRAY['triceps'], 'dumbbell', 'compound', 'Rotate from supinated to pronated as you press.'),
    ('Cable Lateral Raise', 'shoulders', ARRAY[]::text[], 'cable', 'isolation', 'Constant tension; pinky leads.'),
    ('Machine Lateral Raise', 'shoulders', ARRAY[]::text[], 'machine', 'isolation', 'Keep elbows soft; pause at the top.'),
    ('Front Raise', 'shoulders', ARRAY[]::text[], 'dumbbell', 'isolation', 'Raise to eye level; no momentum.'),
    ('Reverse Pec Deck', 'rear delts', ARRAY['back'], 'machine', 'isolation', 'Open up to a T; squeeze shoulder blades.'),
    ('Behind-the-Neck Press', 'shoulders', ARRAY['triceps','traps'], 'barbell', 'compound', 'Only with full overhead mobility.'),
    ('Y-Raise', 'rear delts', ARRAY['traps'], 'dumbbell', 'isolation', 'Light DBs; thumbs up, raise to a Y.'),

    -- BICEPS
    ('Preacher Curl', 'biceps', ARRAY[]::text[], 'barbell', 'isolation', 'Stop just before lockout to keep tension.'),
    ('Incline Dumbbell Curl', 'biceps', ARRAY[]::text[], 'dumbbell', 'isolation', '45° bench; long-head bias.'),
    ('Concentration Curl', 'biceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Elbow braced on inner thigh; squeeze hard.'),
    ('Cable Curl', 'biceps', ARRAY[]::text[], 'cable', 'isolation', 'Constant tension throughout the rep.'),
    ('EZ-Bar Curl', 'biceps', ARRAY[]::text[], 'barbell', 'isolation', 'Wrist-friendly grip; keep elbows pinned.'),
    ('Spider Curl', 'biceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Chest on incline bench; full stretch at the bottom.'),
    ('Zottman Curl', 'biceps', ARRAY['forearms'], 'dumbbell', 'isolation', 'Curl up supinated, lower pronated.'),
    ('Reverse Curl', 'forearms', ARRAY['biceps'], 'barbell', 'isolation', 'Pronated grip; brachialis and forearms.'),

    -- TRICEPS
    ('Close-Grip Bench Press', 'triceps', ARRAY['chest','shoulders'], 'barbell', 'compound', 'Shoulder-width grip; elbows tucked.'),
    ('Overhead Tricep Extension (Cable)', 'triceps', ARRAY[]::text[], 'cable', 'isolation', 'Long-head emphasis with a rope.'),
    ('Overhead Tricep Extension (Dumbbell)', 'triceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Two hands on one DB; full stretch overhead.'),
    ('Cable Rope Pushdown', 'triceps', ARRAY[]::text[], 'cable', 'isolation', 'Spread the rope at the bottom.'),
    ('Single-Arm Cable Pushdown', 'triceps', ARRAY[]::text[], 'cable', 'isolation', 'Reverse-grip option for medial head.'),
    ('Tricep Dip (Bench)', 'triceps', ARRAY[]::text[], 'bodyweight', 'isolation', 'Hands behind, feet forward; elbows back.'),
    ('JM Press', 'triceps', ARRAY['chest'], 'barbell', 'compound', 'Hybrid bench/skull-crusher; elbows tracked.'),

    -- LEGS / QUADS
    ('Hack Squat', 'quadriceps', ARRAY['glutes'], 'machine', 'compound', 'Feet low/narrow for quad bias.'),
    ('Smith Machine Squat', 'quadriceps', ARRAY['glutes'], 'machine', 'compound', 'Feet slightly forward; deep ROM.'),
    ('Goblet Squat', 'quadriceps', ARRAY['glutes','core'], 'dumbbell', 'compound', 'Hold DB at chest; elbows inside the knees.'),
    ('Sissy Squat', 'quadriceps', ARRAY[]::text[], 'bodyweight', 'isolation', 'Lean back, knees travel forward; advanced.'),
    ('Pause Squat', 'quadriceps', ARRAY['glutes'], 'barbell', 'compound', '2-3s pause in the hole; rebuild speed out.'),
    ('Box Squat', 'quadriceps', ARRAY['glutes','hamstrings'], 'barbell', 'compound', 'Sit back to box; vertical shins.'),
    ('Step-Up', 'quadriceps', ARRAY['glutes'], 'dumbbell', 'unilateral', 'Box mid-thigh; drive through heel.'),
    ('Walking Lunge', 'quadriceps', ARRAY['glutes','hamstrings'], 'dumbbell', 'unilateral', 'Long stride; vertical torso.'),
    ('Reverse Lunge', 'quadriceps', ARRAY['glutes'], 'dumbbell', 'unilateral', 'Step back; knee-friendly variant.'),
    ('Lateral Lunge', 'quadriceps', ARRAY['glutes','adductors'], 'dumbbell', 'unilateral', 'Sit into one hip; other leg straight.'),

    -- LEGS / POSTERIOR
    ('Stiff-Leg Deadlift', 'hamstrings', ARRAY['glutes','back'], 'barbell', 'compound', 'Minimal knee bend; bar drags down legs.'),
    ('Glute Bridge', 'glutes', ARRAY['hamstrings'], 'bodyweight', 'isolation', 'Drive through heels; squeeze at the top.'),
    ('Single-Leg Hip Thrust', 'glutes', ARRAY['hamstrings'], 'bodyweight', 'unilateral', 'Tuck the non-working knee; full extension.'),
    ('Cable Pull-Through', 'glutes', ARRAY['hamstrings'], 'cable', 'isolation', 'Hinge from the hips; rope between legs.'),
    ('Good Morning', 'hamstrings', ARRAY['glutes','back'], 'barbell', 'compound', 'Soft knees, hinge with neutral spine.'),
    ('Nordic Hamstring Curl', 'hamstrings', ARRAY[]::text[], 'bodyweight', 'isolation', 'Anchor heels; lower as slowly as possible.'),
    ('Glute-Ham Raise', 'hamstrings', ARRAY['glutes'], 'machine', 'isolation', 'GHD pad; knees bent and hips extend.'),
    ('Seated Leg Curl', 'hamstrings', ARRAY[]::text[], 'machine', 'isolation', 'Slight pause in the contracted position.'),
    ('Standing Leg Curl', 'hamstrings', ARRAY[]::text[], 'machine', 'isolation', 'One leg at a time; minimal hip movement.'),
    ('Sumo Squat', 'quadriceps', ARRAY['glutes','adductors'], 'dumbbell', 'compound', 'Wide stance; toes pointed out ~30°.'),
    ('Single-Leg RDL', 'hamstrings', ARRAY['glutes'], 'dumbbell', 'unilateral', 'Hips square; reach DB toward floor.'),

    -- CALVES / TIBIALIS
    ('Seated Calf Raise', 'calves', ARRAY[]::text[], 'machine', 'isolation', 'Soleus emphasis; full ROM.'),
    ('Donkey Calf Raise', 'calves', ARRAY[]::text[], 'machine', 'isolation', 'Hinged stance loads gastroc.'),
    ('Single-Leg Calf Raise', 'calves', ARRAY[]::text[], 'bodyweight', 'isolation', 'On a step for full stretch.'),
    ('Tibialis Raise', 'calves', ARRAY[]::text[], 'bodyweight', 'isolation', 'Heels on plate; lift toes — knee health.'),

    -- CORE
    ('Russian Twist', 'core', ARRAY['obliques'], 'bodyweight', 'isolation', 'Lean back ~45°; rotate from torso, not arms.'),
    ('Dead Bug', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Press low back into the floor throughout.'),
    ('Bird Dog', 'core', ARRAY['glutes','back'], 'bodyweight', 'isolation', 'Square hips; resist rotation.'),
    ('Pallof Press', 'core', ARRAY['obliques'], 'cable', 'isolation', 'Anti-rotation; press straight out and back.'),
    ('Side Plank', 'obliques', ARRAY['core'], 'bodyweight', 'isolation', 'Stack hips; head-to-heel straight line.'),
    ('Ab Wheel Rollout', 'core', ARRAY['shoulders','back'], 'bodyweight', 'isolation', 'Rib cage tucked; never let the lower back arch.'),
    ('Decline Sit-Up', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Add weight to chest for progression.'),
    ('V-Up', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Touch hands to feet at the apex.'),
    ('Mountain Climber', 'core', ARRAY['cardio'], 'bodyweight', 'isolation', 'Hips low; alternate knees fast.'),
    ('Toes-to-Bar', 'core', ARRAY['back'], 'bodyweight', 'isolation', 'Hollow body; touch toes to the bar.'),
    ('Reverse Crunch', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Lift hips off the floor; legs vertical.'),

    -- OLYMPIC / POWER
    ('Power Clean', 'back', ARRAY['quadriceps','glutes','traps'], 'barbell', 'compound', 'Triple extension; receive in a quarter squat.'),
    ('Hang Clean', 'back', ARRAY['quadriceps','glutes','traps'], 'barbell', 'compound', 'Start from mid-thigh; explosive hip drive.'),
    ('Clean and Jerk', 'back', ARRAY['quadriceps','shoulders','triceps'], 'barbell', 'compound', 'Full clean into split jerk overhead.'),
    ('Snatch', 'back', ARRAY['quadriceps','shoulders'], 'barbell', 'compound', 'Wide grip; bar from floor to overhead in one move.'),
    ('Hang Snatch', 'back', ARRAY['quadriceps','shoulders'], 'barbell', 'compound', 'From the hang; technique drill or power work.'),
    ('Push Jerk', 'shoulders', ARRAY['triceps','quadriceps'], 'barbell', 'compound', 'Dip-drive-receive; quarter-squat catch.'),
    ('Split Jerk', 'shoulders', ARRAY['triceps','quadriceps'], 'barbell', 'compound', 'Dip-drive into split stance overhead.'),
    ('Clean Pull', 'back', ARRAY['glutes','traps'], 'barbell', 'compound', 'Heavy; finishes at the shrug.'),

    -- CONDITIONING / CARDIO
    ('Rowing Erg (HIIT)', 'cardio', ARRAY['back','legs'], 'machine', 'cardio', 'Drive with the legs first; arms last.'),
    ('Rowing Erg (LISS)', 'cardio', ARRAY['back','legs'], 'machine', 'cardio', 'Steady pace; conversational effort.'),
    ('Assault Bike', 'cardio', ARRAY[]::text[], 'machine', 'cardio', 'Push and pull arms; max effort intervals.'),
    ('Jump Rope', 'cardio', ARRAY['calves'], 'bodyweight', 'cardio', 'Soft knees; wrists do the work.'),
    ('Sled Push', 'cardio', ARRAY['quadriceps','glutes'], 'machine', 'cardio', 'Low arms; drive long strides.'),
    ('Sled Pull', 'cardio', ARRAY['back','hamstrings'], 'machine', 'cardio', 'Backward walk for VMO/knee health.'),
    ('Burpee', 'cardio', ARRAY['chest','core'], 'bodyweight', 'cardio', 'Chest to floor; jump and clap.'),
    ('Box Jump', 'cardio', ARRAY['quadriceps','glutes'], 'bodyweight', 'cardio', 'Land soft; step down to save knees.'),
    ('Kettlebell Swing', 'glutes', ARRAY['hamstrings','core'], 'kettlebell', 'compound', 'Hip hinge, not a squat; snap at the top.'),
    ('Kettlebell Snatch', 'shoulders', ARRAY['back','glutes'], 'kettlebell', 'compound', 'One-handed swing into overhead lockout.'),
    ('Farmers Carry', 'core', ARRAY['traps','forearms'], 'dumbbell', 'compound', 'Tall posture; full grip and breathe.'),
    ('Battle Ropes', 'cardio', ARRAY['shoulders','core'], 'bodyweight', 'cardio', 'Quarter-squat stance; alternating waves.'),

    -- FOREARMS
    ('Wrist Curl', 'forearms', ARRAY[]::text[], 'dumbbell', 'isolation', 'Forearms on bench; full ROM.'),
    ('Reverse Wrist Curl', 'forearms', ARRAY[]::text[], 'dumbbell', 'isolation', 'Pronated; extensor bias.')
)
INSERT INTO public.exercises
  (source, name, primary_muscle, secondary_muscles, equipment, category, cues, is_public)
SELECT
  'global'::exercise_source, n.name, n.primary_muscle, n.secondary_muscles, n.equipment, n.category, n.cues, true
FROM new_exercises n
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e
  WHERE e.source IN ('global','wger') AND lower(e.name) = lower(n.name)
);
