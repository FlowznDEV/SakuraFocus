from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
import uuid
from schemas import TaskCreate, TaskUpdate, TaskResponse, APIResponse
from supabase_client import get_supabase_admin_client
from security import get_current_user
from supabase import Client

router = APIRouter(prefix="/api/tasks", tags=["Tarefas (Tasks)"])

@router.get("", response_model=List[dict], summary="Listar tarefas do usuário autenticado")
def get_tasks(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Exemplo GET: Busca tarefas pertencentes ESTRITAMENTE ao usuário autenticado no JWT do Supabase Auth.
    Garante o isolamento entre contas e alinhamento com as regras RLS do banco.
    """
    try:
        user_id = current_user["id"]
        response = supabase.table("user_tasks").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar tarefas no Supabase: {str(e)}"
        )

@router.get("/{task_id}", response_model=dict, summary="Obter detalhes de uma tarefa por UUID")
def get_task_by_id(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Exemplo GET (por ID): Busca tarefa específica garantindo pertencimento ao usuário logado.
    """
    try:
        user_id = current_user["id"]
        response = supabase.table("user_tasks").select("*").eq("id", task_id).eq("user_id", user_id).execute()
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tarefa com ID '{task_id}' não foi encontrada para seu usuário."
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao consultar tarefa no Supabase: {str(e)}"
        )

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED, summary="Criar nova tarefa")
def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Exemplo POST: Insere uma nova tarefa no Supabase vinculando o user_id do token autenticado.
    """
    try:
        # Força o user_id vindo do JWT verificado do Supabase Auth por segurança
        authenticated_user_id = current_user["id"]
        new_task = {
            "id": str(uuid.uuid4()),
            "user_id": authenticated_user_id,
            "title": task_data.title,
            "category": task_data.category or "Geral",
            "difficulty": task_data.difficulty or "Médio",
            "xp_reward": task_data.xp_reward or 30,
            "estimated_minutes": task_data.estimated_minutes or 15,
            "completed": False
        }

        response = supabase.table("user_tasks").insert(new_task).execute()
        
        return APIResponse(
            success=True,
            message="Tarefa criada com sucesso no Supabase com validação JWT!",
            data=response.data[0] if response.data else new_task
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao inserir tarefa no Supabase: {str(e)}"
        )

@router.put("/{task_id}", response_model=APIResponse, summary="Atualizar tarefa existente")
def update_task(
    task_id: str,
    update_data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Exemplo PUT: Atualiza registro garantindo pertencimento ao usuário do token.
    """
    try:
        user_id = current_user["id"]
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhum campo fornecido para atualização."
            )

        response = (
            supabase.table("user_tasks")
            .update(update_dict)
            .eq("id", task_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tarefa '{task_id}' não encontrada ou você não tem permissão para editá-la."
            )

        return APIResponse(
            success=True,
            message=f"Tarefa '{task_id}' atualizada com sucesso no Supabase!",
            data=response.data[0]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar tarefa no Supabase: {str(e)}"
        )

@router.delete("/{task_id}", response_model=APIResponse, summary="Remover tarefa")
def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Exemplo DELETE: Deleta a tarefa do usuário logado.
    """
    try:
        user_id = current_user["id"]
        response = (
            supabase.table("user_tasks")
            .delete()
            .eq("id", task_id)
            .eq("user_id", user_id)
            .execute()
        )

        return APIResponse(
            success=True,
            message=f"Tarefa '{task_id}' removida com sucesso do Supabase.",
            data={"deleted_id": task_id, "user_id": user_id}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar tarefa no Supabase: {str(e)}"
        )
