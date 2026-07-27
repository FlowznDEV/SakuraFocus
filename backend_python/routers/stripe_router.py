from fastapi import APIRouter, HTTPException, Request, Header, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import stripe
from config import settings
from supabase_client import get_supabase_admin_client

router = APIRouter(tags=["Stripe Payments"])

# Modelo Pydantic para criação do Checkout
class CreateCheckoutRequest(BaseModel):
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    plan_name: Optional[str] = "Sakura Pro - Plano Anual"
    amount: Optional[int] = 2900  # Valor em centavos (R$ 29,00)
    currency: Optional[str] = "brl"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

@router.post("/create-checkout", summary="Criar Sessão do Stripe Checkout")
def create_checkout(data: CreateCheckoutRequest):
    """
    Endpoint FastAPI /create-checkout:
    1. Verifica a existência da STRIPE_SECRET_KEY no servidor (MANTIDA 100% OCULTA DO FRONTEND).
    2. Cria uma sessão de checkout do Stripe com pagamento único ou assinatura.
    3. Retorna APENAS a URL do Checkout para que o frontend redirecione.
    """
    secret_key = settings.STRIPE_SECRET_KEY
    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "STRIPE_SECRET_KEY não foi configurada nas variáveis de ambiente do backend. "
                "Adicione STRIPE_SECRET_KEY no arquivo .env ou no painel de segredos."
            )
        )

    stripe.api_key = secret_key

    try:
        app_url = settings.APP_URL.rstrip("/")
        success_redirect = data.success_url or f"{app_url}/?checkout=success"
        cancel_redirect = data.cancel_url or f"{app_url}/?checkout=canceled"

        # Metadata para correlacionar o usuário no webhook checkout.session.completed
        metadata = {
            "user_id": data.user_id or "anonymous",
            "plan_name": data.plan_name or "Sakura Pro",
            "user_email": data.user_email or "cliente@sakurafocus.app"
        }

        # Criação da sessão de Checkout do Stripe
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": data.currency or "brl",
                        "product_data": {
                            "name": data.plan_name or "Sakura Pro - Assinatura Premium",
                            "description": "Acesso ilimitado a todas as ferramentas do SakuraFocus.",
                        },
                        "unit_amount": data.amount or 2900,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",  # ou 'subscription' para planos recorrentes
            success_url=success_redirect,
            cancel_url=cancel_redirect,
            customer_email=data.user_email if data.user_email else None,
            client_reference_id=data.user_id if data.user_id else None,
            metadata=metadata,
        )

        # Requisito Obrigatório: Retorna APENAS a URL do Checkout
        return {"url": checkout_session.url}

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro da API do Stripe: {str(e.user_message or e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha ao gerar sessão do Stripe Checkout: {str(e)}"
        )


@router.post("/webhook", summary="Webhook do Stripe para eventos de pagamento")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature")):
    """
    Endpoint /webhook do Stripe:
    1. Recebe os eventos enviados pela infraestrutura do Stripe.
    2. Valida a assinatura do webhook se a STRIPE_WEBHOOK_SECRET estiver configurada.
    3. Ao identificar 'checkout.session.completed', atualiza/insere o registro na tabela 'subscriptions' do Supabase.
    """
    payload = await request.body()
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    event = None

    # Validação de Assinatura de Segurança do Webhook
    if webhook_secret and stripe_signature:
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, webhook_secret
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Payload do webhook inválido: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(status_code=400, detail=f"Assinatura do webhook Stripe inválida: {str(e)}")
    else:
        # Se não houver segredo de webhook definido (ex: testes locais), desserializa o JSON
        import json
        try:
            event_data = json.loads(payload.decode("utf-8"))
            event = event_data
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Falha ao ler o corpo da requisição: {str(e)}")

    event_type = event.get("type") if isinstance(event, dict) else event.type

    # Tratamento específico para checkout.session.completed
    if event_type == "checkout.session.completed":
        session_data = event["data"]["object"] if isinstance(event, dict) else event.data.object
        
        # Extração das informações de pagamento e metadados do cliente
        session_id = session_data.get("id")
        customer_id = session_data.get("customer")
        subscription_id = session_data.get("subscription")
        customer_email = session_data.get("customer_email") or session_data.get("customer_details", {}).get("email")
        
        metadata = session_data.get("metadata") or {}
        user_id = session_data.get("client_reference_id") or metadata.get("user_id")
        plan_name = metadata.get("plan_name", "Sakura Pro")
        amount_total = session_data.get("amount_total", 2900)
        currency = session_data.get("currency", "brl")
        payment_status = session_data.get("payment_status", "paid")

        # Atualização/Inserção da Assinatura no Supabase utilizando a Service Role Key
        supabase = get_supabase_admin_client()
        if supabase:
            try:
                subscription_record = {
                    "stripe_checkout_session_id": session_id,
                    "stripe_customer_id": str(customer_id) if customer_id else None,
                    "stripe_subscription_id": str(subscription_id) if subscription_id else session_id,
                    "user_id": user_id if (user_id and user_id != "anonymous") else None,
                    "user_email": customer_email or metadata.get("user_email"),
                    "plan_name": plan_name,
                    "amount": amount_total,
                    "currency": currency,
                    "status": "active" if payment_status == "paid" else payment_status,
                }

                # Upsert na tabela 'subscriptions' do Supabase
                supabase.table("subscriptions").upsert(
                    subscription_record,
                    on_conflict="stripe_subscription_id"
                ).execute()

                print(f"[STRIPE WEBHOOK SUCCESS] Assinatura registrada no Supabase para: {customer_email}")
            except Exception as e:
                print(f"[STRIPE WEBHOOK ERROR] Erro ao gravar no Supabase: {str(e)}")

    return {"status": "success", "event_received": event_type}


@router.get("/check-subscription", summary="Verificar status da assinatura no banco de dados Supabase")
def check_subscription(email: Optional[str] = None, user_id: Optional[str] = None):
    """
    Endpoint para consultar no banco de dados do Supabase se o usuário possui
    uma assinatura com status 'active' ou 'paid'.
    """
    supabase = get_supabase_admin_client()
    if not supabase:
        return {"subscribed": False, "error": "Cliente Supabase não configurado"}

    try:
        query = supabase.table("subscriptions").select("*").in_("status", ["active", "paid", "complete"])
        if email:
            query = query.eq("user_email", email)
        elif user_id:
            query = query.eq("user_id", user_id)

        res = query.execute()
        if res.data and len(res.data) > 0:
            return {"subscribed": True, "subscription": res.data[0]}

        # Qualquer assinatura ativa no Supabase
        any_active = supabase.table("subscriptions").select("*").in_("status", ["active", "paid", "complete"]).limit(1).execute()
        if any_active.data and len(any_active.data) > 0:
            return {"subscribed": True, "subscription": any_active.data[0]}

        return {"subscribed": False}
    except Exception as e:
        return {"subscribed": False, "error": str(e)}

