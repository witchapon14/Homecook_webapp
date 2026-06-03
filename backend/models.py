from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from database import Base


def now_utc():
    return datetime.now(timezone.utc)


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    unit = Column(String(40), nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_utc, nullable=False)

    items = relationship("PurchaseItem", back_populates="ingredient")


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    purchase_date = Column(Date, nullable=False, index=True)
    total_amount = Column(Numeric(12, 2, asdecimal=False), default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id", ondelete="CASCADE"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity = Column(Numeric(12, 2, asdecimal=False), nullable=False)
    unit = Column(String(40), nullable=False)
    unit_price = Column(Numeric(12, 2, asdecimal=False), nullable=False)
    amount = Column(Numeric(12, 2, asdecimal=False), nullable=False)

    purchase = relationship("Purchase", back_populates="items")
    ingredient = relationship("Ingredient", back_populates="items")
