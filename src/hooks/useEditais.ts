import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { readPdfMeta, extractTextByPage, type PageText } from '@/lib/pdfMeta';

export type EditalStatus = 'uploading' | 'extracting' | 'ready' | 'failed';

export interface Edital {
  id: string;
  user_id: string;
  titulo: string;
  banca: string | null;
  cargo: string | null;
  municipio: string | null;
  ano: number | null;
  status: EditalStatus;
  status_message: string | null;
  pdf_storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface EditalMateria {
  id: string;
  edital_id: string;
  nome: string;
  num_questoes: number | null;
  peso: number | null;
}

export function useEditais() {
  const { toast } = useToast();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEditais = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('editais')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEditais((data as Edital[]) ?? []);
    } catch (err) {
      toast({ title: 'Erro ao carregar editais', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEditalMaterias = useCallback(async (editalId: string): Promise<EditalMateria[]> => {
    const { data, error } = await supabase
      .from('edital_materias')
      .select('*')
      .eq('edital_id', editalId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as EditalMateria[]) ?? [];
  }, []);

  const deleteEdital = useCallback(async (id: string) => {
    const edital = editais.find((e) => e.id === id);
    if (edital?.pdf_storage_path) {
      await supabase.storage.from('editais-pdfs').remove([edital.pdf_storage_path]);
    }
    const { error } = await supabase.from('editais').delete().eq('id', id);
    if (error) throw error;
    setEditais((prev) => prev.filter((e) => e.id !== id));
  }, [editais]);

  const uploadEdital = useCallback(async (
    userId: string,
    params: {
      titulo: string;
      banca?: string;
      cargo?: string;
      municipio?: string;
      ano?: number;
      pdfFile: File;
      onProgress?: (stage: string) => void;
    }
  ): Promise<{ editalId: string }> => {
    const { titulo, banca, cargo, municipio, ano, pdfFile, onProgress } = params;

    // 1. Lê metadados do PDF
    onProgress?.('reading');
    const meta = await readPdfMeta(pdfFile);

    // 2. Cria registro no banco
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Sessão expirada. Faça login novamente.');

    const { data: editalRow, error: insertError } = await supabase
      .from('editais')
      .insert({
        user_id: userId,
        titulo,
        banca: banca || null,
        cargo: cargo || null,
        municipio: municipio || null,
        ano: ano || null,
        status: 'uploading',
      })
      .select()
      .single();

    if (insertError || !editalRow) throw new Error(insertError?.message ?? 'Falha ao criar edital');
    const editalId = (editalRow as Edital).id;

    // 3. Upload do PDF
    onProgress?.('uploading');
    const storagePath = `${userId}/${editalId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('editais-pdfs')
      .upload(storagePath, pdfFile, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      await supabase.from('editais').update({ status: 'failed', status_message: uploadError.message }).eq('id', editalId);
      throw new Error(`Falha ao enviar PDF: ${uploadError.message}`);
    }

    await supabase.from('editais').update({ pdf_storage_path: storagePath }).eq('id', editalId);

    // 4. Extrai texto do PDF no browser
    onProgress?.('extracting_text');
    const pages: PageText[] = await extractTextByPage(pdfFile);

    // 5. Chama edge function pra extrair matérias
    onProgress?.('ingesting');
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-edital`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          edital_id: editalId,
          pages,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? 'Falha na extração das matérias');
    }

    return { editalId };
  }, []);

  return {
    editais,
    loading,
    fetchEditais,
    fetchEditalMaterias,
    uploadEdital,
    deleteEdital,
  };
}
