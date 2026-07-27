from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from routers.tasks import router as tasks_router
from routers.stripe_router import router as stripe_router

app = FastAPI(
    title="Supabase FastAPI Service - SakuraFocus",
    description=(
        "Backend em Python com FastAPI integrado ao Supabase seguindo boas práticas de segurança.\n\n"
        "REGRAS DE SEGURANÇA:\n"
        "- A Service Role Key fica protegida apenas no ambiente do servidor.\n"
        "- Nenhuma chave privada é exposta ao código cliente/frontend."
    ),
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção configure a URL exata do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handler Global para Tratamento Amigável de Erros
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Erro Interno do Servidor",
            "detail": str(exc)
        }
    )

# Rota Health Check do Servidor
@app.get("/health", tags=["Status"])
def health_check():
    """Verifica se o backend FastAPI e as variáveis do Supabase estão ativas."""
    has_url = bool(settings.SUPABASE_URL)
    has_service_key = bool(settings.SUPABASE_SERVICE_ROLE_KEY)
    
    return {
        "status": "online",
        "service": "FastAPI + Supabase Python Service",
        "supabase_configured": has_url and has_service_key,
        "security_check": "SUPABASE_SERVICE_ROLE_KEY protegida no backend"
    }

# Incluir Rotas do Módulo de Tarefas e Stripe
app.include_router(tasks_router)
app.include_router(stripe_router)

if __name__ == "__main__":
    import uvicorn
    # Executa o servidor na porta 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
