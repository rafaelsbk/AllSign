from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Permite acesso apenas a usuários com o cargo de Administrador.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role and request.user.role.name == 'Administrador'

class IsAdminOrManager(BasePermission):
    """
    Permite acesso a Administradores ou Gerentes (se essa role for usada).
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.role):
            return False
        return request.user.role.name in ['Administrador', 'Manager'] # O nome 'Manager' é do sistema antigo, pode ser ajustado
