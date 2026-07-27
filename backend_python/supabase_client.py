from supabase import create_client, Client
from config import settings

def get_supabase_admin_client() -> Client:
    """
    Retorna o cliente administrativo oficial do Supabase (Service Role Client).
    
    REGRA DE SEGURANÇA:
    - Executado EXCLUSIVAMENTE dentro do ambiente servidor Node/Python.
    - Utiliza a SUPABASE_SERVICE_ROLE_KEY com privilégios administrativos.
    - NUNCA envie este cliente ou a chave para o frontend.
    """
    settings.validate()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
