"""
Ingredient Normalizer Service
Handles fuzzy matching and alias resolution for ingredients
"""
from rapidfuzz import fuzz, process
import json
import os
from pathlib import Path

class IngredientNormalizer:
    """Normalizes user input ingredients to canonical names"""
    
    def __init__(self):
        self.aliases: dict[str, list[str]] = {}
        self.canonical_to_aliases: dict[str, list[str]] = {}
        self._load_aliases()
    
    def _load_aliases(self):
        """Load ingredient aliases from recipes.json"""
        data_path = Path(__file__).parent.parent / "data" / "recipes.json"
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.canonical_to_aliases = data.get("ingredient_aliases", {})
                # Build reverse mapping
                for canonical, aliases in self.canonical_to_aliases.items():
                    for alias in aliases:
                        self.aliases[alias.lower()] = canonical.lower()
                    self.aliases[canonical.lower()] = canonical.lower()
        except Exception as e:
            print(f"Warning: Could not load aliases: {e}")
    
    def normalize(self, ingredient: str) -> str:
        """
        Normalize a single ingredient name.
        Returns canonical name or cleaned input.
        """
        # Clean input
        cleaned = ingredient.strip().lower()
        
        # Direct alias match
        if cleaned in self.aliases:
            return self.aliases[cleaned]
        
        # Fuzzy match against all known names
        all_names = list(self.aliases.keys())
        if all_names:
            result = process.extractOne(
                cleaned, 
                all_names, 
                scorer=fuzz.ratio,
                score_cutoff=80
            )
            if result:
                matched_name, score, _ = result
                return self.aliases.get(matched_name, matched_name)
        
        # Return cleaned input if no match
        return cleaned
    
    def normalize_list(self, ingredients: list[str]) -> list[str]:
        """Normalize a list of ingredients, removing duplicates"""
        normalized = []
        seen = set()
        for ing in ingredients:
            norm = self.normalize(ing)
            if norm and norm not in seen:
                normalized.append(norm)
                seen.add(norm)
        return normalized
    
    def parse_input(self, raw_input: str) -> list[str]:
        """
        Parse comma-separated ingredient input.
        Returns normalized, deduplicated list.
        """
        if not raw_input or not raw_input.strip():
            return []
        
        # Split by comma, semicolon, or newline
        import re
        parts = re.split(r'[,;\n]+', raw_input)
        
        # Clean and filter empty
        ingredients = [p.strip() for p in parts if p.strip()]
        
        return self.normalize_list(ingredients)


# Singleton instance
normalizer = IngredientNormalizer()
