"""Normalize technical skills and calculate deterministic alignment."""

import re
import unicodedata
from collections.abc import Iterable
from typing import TypedDict

from skill_relations import EXACT_ALIASES, RELATED_SKILL_GROUPS, SKILL_CATEGORIES

EXACT_MATCH_WEIGHT = 1.0
RELATED_MATCH_WEIGHT = 0.75


class MatchResult(TypedDict):
    exact_matches: list[str]
    related_matches: list[str]
    missing_skills: list[str]
    match_percentage: float


def normalize_skill(skill: str) -> str:
    """Case-fold and collapse whitespace without discarding meaningful symbols."""
    normalized = unicodedata.normalize("NFKC", skill).casefold()
    return re.sub(r"\s+", " ", normalized).strip()


def canonicalize_skill(skill: str) -> str:
    """Return the canonical technology name, applying exact aliases only."""
    normalized = normalize_skill(skill)
    return normalize_skill(EXACT_ALIASES.get(normalized, normalized))


def _canonical_memberships(
    groups: dict[str, tuple[str, ...]],
) -> dict[str, frozenset[str]]:
    return {
        canonicalize_skill(group): frozenset(canonicalize_skill(skill) for skill in members)
        for group, members in groups.items()
    }


_RELATED_GROUPS = _canonical_memberships(RELATED_SKILL_GROUPS)
_CATEGORY_MEMBERS = _canonical_memberships(SKILL_CATEGORIES)
_RELATED_SKILLS_BY_SKILL: dict[str, set[str]] = {}

for _members in _RELATED_GROUPS.values():
    for _skill in _members:
        _RELATED_SKILLS_BY_SKILL.setdefault(_skill, set()).update(_members - {_skill})


def _normalize_skills(skills: Iterable[str] | str | None) -> set[str]:
    if skills is None:
        return set()
    if isinstance(skills, str):
        skills = (skills,)
    return {
        canonicalize_skill(skill)
        for skill in skills
        if isinstance(skill, str) and normalize_skill(skill)
    }


def _has_related_skill(candidate_skills: set[str], jd_skill: str) -> bool:
    category_members = _CATEGORY_MEMBERS.get(jd_skill)
    if category_members and candidate_skills.intersection(category_members):
        return True
    return bool(candidate_skills.intersection(_RELATED_SKILLS_BY_SKILL.get(jd_skill, set())))


def calculate_match(
    resume_skills: Iterable[str] | str | None,
    jd_skills: Iterable[str] | str | None,
) -> MatchResult:
    """Classify JD skills and score exact matches at 1.0, related at 0.75."""
    resume_set = _normalize_skills(resume_skills)
    jd_set = _normalize_skills(jd_skills)

    exact_matches = sorted(resume_set.intersection(jd_set))
    related_matches: list[str] = []
    missing_skills: list[str] = []

    for jd_skill in sorted(jd_set - resume_set):
        if _has_related_skill(resume_set, jd_skill):
            related_matches.append(jd_skill)
        else:
            missing_skills.append(jd_skill)

    total_score = (
        len(exact_matches) * EXACT_MATCH_WEIGHT
        + len(related_matches) * RELATED_MATCH_WEIGHT
    )
    match_percentage = round((total_score / len(jd_set)) * 100, 2) if jd_set else 0.0

    return {
        "exact_matches": exact_matches,
        "related_matches": related_matches,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
    }