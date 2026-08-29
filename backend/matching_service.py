from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from matching.scoring import rank_matches


app = FastAPI(title="UniMatch Matching Service")


class CourseInput(BaseModel):
    code: str
    name: str


class FreeSlotInput(BaseModel):
    day: str
    window: str


class StudentInput(BaseModel):
    id: str
    name: str
    faculty: str | None = None
    year_of_study: int | None = Field(default=None, alias="yearOfStudy")
    courses: list[CourseInput]
    interests: list[str]
    free_slots: list[FreeSlotInput] = Field(default_factory=list, alias="freeSlots")

    @property
    def yearOfStudy(self) -> int | None:
        return self.year_of_study

    @property
    def freeSlots(self) -> list[FreeSlotInput]:
        return self.free_slots


class RankRequest(BaseModel):
    query_student: StudentInput = Field(alias="queryStudent")
    candidates: list[StudentInput]
    top_k: int = Field(default=20, alias="topK")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/rank")
def rank(request: RankRequest) -> list[dict]:
    return rank_matches(request.query_student, request.candidates, request.top_k)
