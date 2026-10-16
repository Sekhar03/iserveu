import React from 'react';
import { AppUser, RolePermission, UserSession } from '../types';
import { UserManagement } from './UserManagement';

interface AdminSettingsProps {
  usersList: AppUser[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser?: (user: AppUser) => void;
  onUpdateUserStatus: (userId: string, status: 'Active' | 'Inactive') => void;
  onUpdateUserPrivileges: (userId: string, userPrivileges: Record<string, boolean>) => void;
  onDeleteUser: (userId: string) => void;
  permissionsList: RolePermission[];
  onUpdatePermissions: (permissions: RolePermission[]) => void;
  onAddPermission: (newPerm: RolePermission) => void;
  onUpdatePermission?: (updatedPerm: RolePermission) => void;
  onDeletePermission: (permId: string) => void;
  userSession: UserSession;
}

export const AdminSettings: React.FC<AdminSettingsProps> = (props) => {
  const fallbackUpdateUser = props.onUpdateUser || ((updatedUser: AppUser) => {
    // Default fallback if not provided
    console.log('Update user:', updatedUser);
  });

  const fallbackUpdatePermission = props.onUpdatePermission || ((updatedPerm: RolePermission) => {
    props.onUpdatePermissions(
      props.permissionsList.map((p) => (p.id === updatedPerm.id ? updatedPerm : p))
    );
  });

  return (
    <UserManagement
      {...props}
      onUpdateUser={fallbackUpdateUser}
      onUpdatePermission={fallbackUpdatePermission}
    />
  );
};
