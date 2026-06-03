from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class IngredientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    unit: str = Field(min_length=1, max_length=40)


class IngredientUpdate(IngredientCreate):
    pass


class IngredientOut(BaseModel):
    id: int
    name: str
    unit: str
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseItemIn(BaseModel):
    ingredient_id: int
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)


class PurchaseItemOut(BaseModel):
    id: int
    ingredient_id: int
    ingredient_name: str
    quantity: Decimal
    unit: str
    unit_price: Decimal
    amount: Decimal


class PurchaseCreate(BaseModel):
    purchase_date: date
    items: list[PurchaseItemIn]


class PurchaseOut(BaseModel):
    id: int
    purchase_date: date
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    items: list[PurchaseItemOut]


class DashboardOut(BaseModel):
    today_total: Decimal
    today_item_count: int
    today_ingredients: list[str]
    month_total: Decimal
    ingredient_count: int
    month_recorded_days: int
    month_item_count: int


class ReportPoint(BaseModel):
    label: str
    total: Decimal
    count: int


class TopIngredient(BaseModel):
    ingredient_name: str
    purchase_count: int
    total_quantity: Decimal
    total_amount: Decimal


class ReportOut(BaseModel):
    scope: str
    total_amount: Decimal
    item_count: int
    recorded_days: int
    series: list[ReportPoint]
    top_ingredients: list[TopIngredient]
