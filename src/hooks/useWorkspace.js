import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getWorkspace } from '../services/supabaseServices';

export function useWorkspace() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState({ farm: null, season: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await getWorkspace(user.id);
        if (mounted) setWorkspace(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { ...workspace, loading, error };
}

