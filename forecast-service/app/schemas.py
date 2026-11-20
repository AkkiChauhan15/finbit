from typing import Annotated

from pydantic import BaseModel, Field


class MonthTotal(BaseModel):
    month: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    total: float = Field(ge=0)


class ForecastRequest(BaseModel):
    monthlyExpenses: Annotated[list[MonthTotal], Field(max_length=24)] = []
    monthlyIncome: Annotated[list[MonthTotal], Field(max_length=24)] = []
    currentBalance: float = Field(default=0)
    horizonMonths: int = Field(ge=1, le=6)


class ExpenseInput(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    date: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")
    category: str = Field(min_length=1, max_length=80)
    amount: float = Field(gt=0)


class AnomaliesRequest(BaseModel):
    expenses: Annotated[list[ExpenseInput], Field(max_length=5000)]
