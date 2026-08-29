from __future__ import annotations

from typing import Any

from .embeddings import semantic_similarity


WEIGHTS = {
    "semantic": 0.40,
    "course": 0.30,
    "interest": 0.20,
    "free_time": 0.10,
}


def rank_matches(query_student: Any, candidates: list[Any], top_k: int = 20) -> list[dict]:
    scored = []
    for candidate in candidates:
        features = compute_features(query_student, candidate)
        score = round(
            100
            * (
                WEIGHTS["semantic"] * features["semantic_score"]
                + WEIGHTS["course"] * features["course_score"]
                + WEIGHTS["interest"] * features["interest_score"]
                + WEIGHTS["free_time"] * features["free_time_score"]
            )
        )
        reasons = explain(query_student, candidate)
        if score == 0 or not reasons:
            continue
        scored.append(
            {
                "studentId": candidate.id,
                "score": min(100, score),
                "reasons": reasons,
                "aiSummary": summarize(query_student.name, candidate.name, reasons),
                "debug": features,
            }
        )

    scored.sort(key=lambda item: item["score"], reverse=True)
    return [{key: value for key, value in item.items() if key != "debug"} for item in scored[:top_k]]


def compute_features(query_student: Any, candidate: Any) -> dict[str, float]:
    shared_courses = _shared_courses(query_student, candidate)
    shared_interests = _shared_interests(query_student, candidate)
    shared_free_slots = _shared_free_slots(query_student, candidate)

    return {
        "semantic_score": semantic_similarity(query_student, candidate),
        "course_score": min(1.0, len(shared_courses) / 2),
        "interest_score": min(1.0, len(shared_interests) / 3),
        "free_time_score": 1.0 if shared_free_slots else 0.0,
    }


def explain(query_student: Any, candidate: Any) -> list[dict]:
    reasons = []

    for course in _shared_courses(query_student, candidate)[:3]:
        reasons.append(
            {
                "type": "shared_course",
                "courseCode": course["code"],
                "courseName": course["name"],
            }
        )

    for interest in _shared_interests(query_student, candidate)[:3]:
        reasons.append({"type": "shared_interest", "interest": interest})

    shared_free_slots = _shared_free_slots(query_student, candidate)
    if shared_free_slots:
        reasons.append(
            {
                "type": "shared_free_time",
                "day": shared_free_slots[0]["day"],
                "window": shared_free_slots[0]["window"],
            }
        )

    return reasons


def summarize(student_a_name: str, student_b_name: str, reasons: list[dict]) -> str:
    courses = [reason["courseCode"] for reason in reasons if reason["type"] == "shared_course"]
    interests = [reason["interest"] for reason in reasons if reason["type"] == "shared_interest"]
    free_time = next((reason for reason in reasons if reason["type"] == "shared_free_time"), None)
    parts = []

    if courses:
        parts.append(f"both take {_join_human(courses)}")
    if interests:
        parts.append(f"share {_join_human(interests)}")
    if free_time:
        parts.append(f"are free {free_time['day']} {free_time['window']}")

    if not parts:
        return f"{student_a_name} and {student_b_name} have overlapping campus signals."
    return f"{student_a_name} and {student_b_name} {_join_human(parts)}."


def _shared_courses(query_student: Any, candidate: Any) -> list[dict[str, str]]:
    candidate_courses = {course.code.upper(): course for course in candidate.courses}
    shared = []
    for course in query_student.courses:
        if course.code.upper() in candidate_courses:
            shared.append({"code": course.code, "name": course.name})
    return shared


def _shared_interests(query_student: Any, candidate: Any) -> list[str]:
    candidate_interests = set(candidate.interests)
    return [interest for interest in query_student.interests if interest in candidate_interests]


def _shared_free_slots(query_student: Any, candidate: Any) -> list[dict[str, str]]:
    candidate_slots = {(slot.day, slot.window) for slot in candidate.freeSlots}
    return [
        {"day": slot.day, "window": slot.window}
        for slot in query_student.freeSlots
        if (slot.day, slot.window) in candidate_slots
    ]


def _join_human(items: list[str]) -> str:
    if len(items) == 0:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return f"{', '.join(items[:-1])}, and {items[-1]}"
