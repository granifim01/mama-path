from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ProductCatalog
from app.schemas import ProductsResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductsResponse)
def list_products(db: Session = Depends(get_db)) -> ProductsResponse:
    catalog = db.get(ProductCatalog, 1)
    if not catalog:
        raise HTTPException(status_code=404, detail="Products not seeded")
    payload = catalog.payload
    return ProductsResponse(
        updated_at=payload.get("updated_at", ""),
        categories=payload.get("categories", []),
    )
