import { useEffect, useMemo, useState } from 'react';
import { cargos, getCargoBySlug } from '@/data/baependi';

const STORAGE_KEY = 'concursosai.training-cargo';

export function useTrainingCargo() {
  const [selectedCargoSlug, setSelectedCargoSlug] = useState<string>(() => {
    if (typeof window === 'undefined') return cargos[0]?.slug ?? '';
    return window.localStorage.getItem(STORAGE_KEY) || cargos[0]?.slug || '';
  });

  useEffect(() => {
    if (!selectedCargoSlug || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, selectedCargoSlug);
  }, [selectedCargoSlug]);

  const selectedCargo = useMemo(
    () => getCargoBySlug(selectedCargoSlug) ?? cargos[0],
    [selectedCargoSlug],
  );

  return {
    selectedCargo,
    selectedCargoSlug,
    setSelectedCargoSlug,
  } as const;
}
