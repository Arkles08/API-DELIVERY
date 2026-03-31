from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from delivery_api.infrastructure.bootstrap import seed_demo_data
from delivery_api.interfaces.api.v1.routers.health import router as health_router
from delivery_api.interfaces.api.v1.routers.restaurants import router as restaurants_router
from delivery_api.interfaces.api.v1.routers.carts import router as carts_router
from delivery_api.interfaces.api.v1.routers.orders import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_demo_data()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Delivery API", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(restaurants_router, prefix="/api/v1")
    app.include_router(carts_router, prefix="/api/v1")
    app.include_router(orders_router, prefix="/api/v1")

    return app


app = create_app()
