import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '../types';

interface RoleGateProps {
  children: React.ReactNode;
  allow: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ children, allow, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !allow.includes(user.role as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
