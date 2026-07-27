import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env (se existir)
load_dotenv()

class Settings:
    """
    Configurações centralizadas do aplicativo FastAPI.
    Lê estritamente das variáveis de ambiente para garantir segurança máxima.
    """
    SUPABASE_URL: str = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    APP_URL: str = os.getenv("APP_URL", "http://localhost:3000")

    def validate(self):
        """Valida se as chaves obrigatórias do Supabase estão configuradas."""
        if not self.SUPABASE_URL:
            raise ValueError(
                "[ERRO DE CONFIGURAÇÃO] SUPABASE_URL não foi encontrada nas variáveis de ambiente."
            )
        if not self.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "[ERRO DE SEGURANÇA] SUPABASE_SERVICE_ROLE_KEY não foi encontrada nas variáveis de ambiente. "
                "Esta chave é estritamente privada do backend e nunca deve ir para o código cliente!"
            )

settings = Settings()
