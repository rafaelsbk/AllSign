from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Permite acesso apenas para usuários com role ADMIN.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsManagerRole(permissions.BasePermission):
    """
    Permite acesso para usuários com role MANAGER ou ADMIN.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['MANAGER', 'ADMIN'])

class IsUserRole(permissions.BasePermission):
    """
    Permite acesso para qualquer usuário autenticado (USER, MANAGER ou ADMIN).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
