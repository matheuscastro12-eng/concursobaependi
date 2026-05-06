-- Modelo: banco se popula sozinho conforme alunos geram simulados.
-- Aluno autenticado chama essa RPC; cada questão gerada vira uma row em
-- public.question_bank, ficando disponível pra qualquer aluno futuro.

-- Aceita um array JSONB de questões.
-- Estrutura esperada:
--   [{ "materia_id": "...", "categoria": "...", "nivel": "basico"|"avancado",
--      "banca": "...", "cargo_slug": "..." | null, "num_alternativas": 4|5,
--      "enunciado": "...", "alternativas": [{"letter":"A","text":"..."},...],
--      "gabarito": "A"|...|"E", "comentario": "..." }]
--
-- Validação: rejeita rows malformadas individualmente; nunca falha o batch
-- inteiro se algumas questões estão zoadas.

CREATE OR REPLACE FUNCTION public.save_questions_to_bank(_questions jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q jsonb;
  inserted_count int := 0;
BEGIN
  -- Só authenticated pode contribuir (visitor anônimo gerando não popula).
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  IF _questions IS NULL OR jsonb_typeof(_questions) <> 'array' THEN
    RETURN 0;
  END IF;

  FOR q IN SELECT * FROM jsonb_array_elements(_questions)
  LOOP
    -- Validações mínimas: materia_id, gabarito (A-E), alternativas array com 4 ou 5.
    IF (q->>'materia_id') IS NULL OR length(q->>'materia_id') = 0 THEN CONTINUE; END IF;
    IF (q->>'nivel') NOT IN ('basico','avancado') THEN CONTINUE; END IF;
    IF (q->>'gabarito') !~ '^[A-E]$' THEN CONTINUE; END IF;
    IF (q->>'enunciado') IS NULL OR length(trim(q->>'enunciado')) < 10 THEN CONTINUE; END IF;
    IF (q->>'comentario') IS NULL OR length(trim(q->>'comentario')) < 10 THEN CONTINUE; END IF;
    IF jsonb_typeof(q->'alternativas') <> 'array' THEN CONTINUE; END IF;
    IF jsonb_array_length(q->'alternativas') NOT IN (4, 5) THEN CONTINUE; END IF;

    INSERT INTO public.question_bank (
      cargo_slug, materia_id, categoria, nivel, banca, num_alternativas,
      enunciado, alternativas, gabarito, comentario,
      source_model, generated_batch
    ) VALUES (
      NULLIF(q->>'cargo_slug', ''),
      q->>'materia_id',
      COALESCE(q->>'categoria', 'gerais'),
      q->>'nivel',
      COALESCE(NULLIF(q->>'banca', ''), 'INEPAM'),
      (q->>'num_alternativas')::smallint,
      q->>'enunciado',
      q->'alternativas',
      q->>'gabarito',
      q->>'comentario',
      COALESCE(NULLIF(q->>'source_model', ''), 'gemini-2.5-flash'),
      NULL
    );

    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_questions_to_bank(jsonb) TO authenticated;
