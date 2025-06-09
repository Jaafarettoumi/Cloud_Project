from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import json
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cloud-project-ebon.vercel.app/", "http://localhost:3000"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

with open("attractions.json", "r", encoding="utf-8") as f:
    attractions = json.load(f)


@app.get("/search")
async def search_attractions(
        query: Optional[str] = Query(None),
        location: Optional[str] = Query(None),
        category: Optional[str] = Query(None),
        price: Optional[str] = Query(None)
):
    results = attractions

    # Filtre par localisation (pays ou ville)
    if location:
        results = [r for r in results
                   if location.lower() in r["city"].lower()
                   or location.lower() in r["country"].lower()]

    # Filtres supplémentaires
    if category:
        results = [r for r in results if r["category"].lower() == category.lower()]
    if price:
        results = [r for r in results if r["price_range"] == price]

    # Recherche textuelle
    if query:
        query = query.lower()
        results = [r for r in results if any(
            kw in query for kw in " ".join([
                r["name"],
                r["description"],
                " ".join(r["keywords"])
            ]).lower()
        )]

    return {"results": results}

handler = Mangum(app)