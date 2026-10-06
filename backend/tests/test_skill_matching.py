import unittest

from skill_matching import calculate_match, canonicalize_skill


class ExactAliasTests(unittest.TestCase):
    def test_aliases_canonicalize_as_exact_matches(self):
        cases = (
            ("ReactJs", "React", "react"),
            ("HTML5", "HTML", "html"),
            ("REST API", "REST APIs", "rest apis"),
            ("GCP", "Google Cloud", "google cloud"),
        )
        for resume_skill, jd_skill, canonical in cases:
            with self.subTest(resume_skill=resume_skill, jd_skill=jd_skill):
                result = calculate_match([resume_skill], [jd_skill])
                self.assertEqual(result["exact_matches"], [canonical])
                self.assertEqual(result["related_matches"], [])
                self.assertEqual(result["missing_skills"], [])
                self.assertEqual(result["match_percentage"], 100.0)

    def test_normalization_is_case_insensitive_and_whitespace_safe(self):
        self.assertEqual(canonicalize_skill("  ReAcTJs   "), "react")
        self.assertEqual(calculate_match(["  ReAcTJs  "], [" react "])["exact_matches"], ["react"])


class RelatedSkillTests(unittest.TestCase):
    def test_git_and_github_are_related_not_aliases(self):
        self.assertEqual(canonicalize_skill("Git"), "git")
        self.assertEqual(canonicalize_skill("GitHub"), "github")
        result = calculate_match(["Git"], ["GitHub"])
        self.assertEqual(result["exact_matches"], [])
        self.assertEqual(result["related_matches"], ["github"])

    def test_requested_related_matches(self):
        cases = (
            ("FastAPI", "REST APIs", "rest apis"),
            ("PyTest", "Unit Testing", "unit testing"),
            ("GitHub", "Version Control", "version control"),
            ("Pandas", "Data Analysis", "data analysis"),
            ("Docker", "DevOps", "devops"),
            ("React Hooks", "React", "react"),
            ("PostgreSQL", "Relational Databases", "relational databases"),
        )
        for resume_skill, jd_skill, canonical in cases:
            with self.subTest(resume_skill=resume_skill, jd_skill=jd_skill):
                result = calculate_match([resume_skill], [jd_skill])
                self.assertEqual(result["exact_matches"], [])
                self.assertEqual(result["related_matches"], [canonical])
                self.assertEqual(result["missing_skills"], [])
                self.assertEqual(result["match_percentage"], 75.0)


class OvermatchingTests(unittest.TestCase):
    def test_unrelated_skills_remain_missing(self):
        cases = (
            ("Python", "React", "react"),
            ("Python", "Java", "java"),
            ("Git", "Docker", "docker"),
            ("PostgreSQL", "React", "react"),
            ("Python", "SQL", "sql"),
        )
        for resume_skill, jd_skill, canonical in cases:
            with self.subTest(resume_skill=resume_skill, jd_skill=jd_skill):
                result = calculate_match([resume_skill], [jd_skill])
                self.assertEqual(result["exact_matches"], [])
                self.assertEqual(result["related_matches"], [])
                self.assertEqual(result["missing_skills"], [canonical])
                self.assertEqual(result["match_percentage"], 0.0)

    def test_empty_and_duplicate_inputs_are_deterministic(self):
        self.assertEqual(
            calculate_match(["Python"], []),
            {
                "exact_matches": [],
                "related_matches": [],
                "missing_skills": [],
                "match_percentage": 0.0,
            },
        )
        self.assertEqual(
            calculate_match(["ReactJs", "React"], ["React", "react.js"])["exact_matches"],
            ["react"],
        )


if __name__ == "__main__":
    unittest.main()