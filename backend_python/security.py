from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from supabase_client import get_supabase_admin_client

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    supabase: Client = Depends(get_supabase_admin_client)
) -> dict:
    """
    Injeção de Dependência de Segurança para o FastAPI:
    1. Extrai o Token JWT do cabeçalho 'Authorization: Bearer <token>'.
    2. Valida o token junto ao Supabase Auth.
    3. Retorna o objeto do usuário autenticado contendo seu ID de UUID.
    4. Se for inválido ou ausente, lança exceção HTTP 401 Unauthorized.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Acesso negado: Token Bearer JWT de autenticação do Supabase ausente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # Valida o JWT do usuário usando o cliente administrativo do Supabase
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de autenticação inválido ou expirado.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = user_response.user
        return {
            "id": user.id,
            "email": user.email,
            "user_metadata": user.user_metadata or {}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Falha na validação do token com o Supabase Auth: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
