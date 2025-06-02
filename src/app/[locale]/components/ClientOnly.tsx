'use client';

import { useEffect, useState, type ReactNode } from 'react';

// Use a render prop pattern instead of direct function children
interface ClientOnlyProps {
  fallback?: ReactNode;
  children: ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
