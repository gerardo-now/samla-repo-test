"use client";

import { useState, useEffect } from "react";

interface SuperAdminState {
  isSuperAdmin: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if current user is a SAMLA super admin
 * 
 * This determines if the user can see/access the global admin panel.
 * Only SAMLA internal team members have access.
 */
export function useSuperAdmin(): SuperAdminState {
  const [state, setState] = useState<SuperAdminState>({
    isSuperAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function checkSuperAdmin() {
      try {
        const response = await fetch("/api/auth/check-admin");
        
        if (!response.ok) {
          if (mounted) {
            setState({ isSuperAdmin: false, isLoading: false });
          }
          return;
        }

        const data = await response.json();
        
        if (mounted) {
          setState({
            isSuperAdmin: data.isSuperAdmin === true,
            isLoading: false,
          });
        }
      } catch {
        if (mounted) {
          setState({ isSuperAdmin: false, isLoading: false });
        }
      }
    }

    checkSuperAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

