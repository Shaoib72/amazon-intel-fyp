from sqlalchemy import Column, String, Boolean, Integer, DateTime, Numeric, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asin = Column(String(10), unique=True, nullable=False)
    title = Column(Text, nullable=True)
    brand = Column(String(255), nullable=True)
    category = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    amazon_url = Column(Text, nullable=True)
    is_prime = Column(Boolean, default=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    bsr = Column(Integer, nullable=True)
    rating = Column(Numeric(3, 2), nullable=True)
    review_count = Column(Integer, nullable=True)
    in_stock = Column(Boolean, default=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class TrackedProduct(Base):
    __tablename__ = "tracked_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    product_id = Column(String(36), nullable=False)
    tracked_at = Column(DateTime(timezone=True), server_default=func.now())