from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str = Field(..., example="Estudar FastAPI e Supabase", description="Título da tarefa")
    category: Optional[str] = Field("Geral", example="Estudos", description="Categoria da tarefa")
    difficulty: Optional[str] = Field("Médio", example="Fácil", description="Dificuldade (Fácil, Médio, Difícil)")
    xp_reward: Optional[int] = Field(30, ge=0, example=30, description="Recompensa de XP ao concluir")
    estimated_minutes: Optional[int] = Field(15, ge=1, example=25, description="Tempo estimado em minutos")

class TaskCreate(TaskBase):
    user_id: str = Field(..., description="ID de UUID do usuário dono no Supabase Auth")

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, example="Título Atualizado")
    category: Optional[str] = None
    difficulty: Optional[str] = None
    xp_reward: Optional[int] = None
    completed: Optional[bool] = Field(None, description="Status de conclusão")
    completed_at: Optional[str] = Field(None, description="Data/Hora ISO de conclusão")
    estimated_minutes: Optional[int] = None

class TaskResponse(TaskBase):
    id: str
    user_id: str
    completed: bool
    completed_at: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
