from __future__ import annotations

import math
import os
import re
from functools import lru_cache
from typing import Protocol


class StudentLike(Protocol):
    name: str
    faculty: str | None
    yearOfStudy: int | None
    courses: list
    interests: list[str]


def semantic_similarity(query: StudentLike, candidate: StudentLike) -> float:
    """Return a 0..1 semantic score, using SentenceTransformer when installed.

    The fallback is lexical overlap so the service remains usable in a demo
    environment before Python dependencies/model weights are installed.
    """
    query_text = profile_text(query)
    candidate_text = profile_text(candidate)
    model = _load_model()

    if model is None:
        return lexical_similarity(query_text, candidate_text)

    vectors = model.encode([query_text, candidate_text], normalize_embeddings=True)
    score = float(vectors[0] @ vectors[1])
    return max(0.0, min(1.0, score))


def profile_text(student: StudentLike) -> str:
    course_bits = []
    for course in student.courses:
        code = getattr(course, "code", "")
        course_bits.append(code.strip().upper())

    return " ".join(
        [
            f"Name: {student.name}.",
            f"Faculty: {student.faculty or ''}.",
            f"Year: {student.yearOfStudy or ''}.",
            f"Courses: {', '.join(course_bits)}.",
            f"Interests: {', '.join(student.interests)}.",
        ]
    )


def lexical_similarity(left: str, right: str) -> float:
    left_tokens = set(_tokens(left))
    right_tokens = set(_tokens(right))
    if not left_tokens or not right_tokens:
        return 0.0
    return len(left_tokens & right_tokens) / math.sqrt(len(left_tokens) * len(right_tokens))


@lru_cache(maxsize=1)
def _load_model():
    try:
        from sentence_transformers import SentenceTransformer
    except Exception:
        return None

    model_name = os.getenv("MATCHING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    try:
        return SentenceTransformer(model_name)
    except Exception:
        return None


def _tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())
