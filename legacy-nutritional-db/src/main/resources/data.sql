-- ============================================================================
-- Jeu de données de départ : valeurs nutritionnelles pour 100 g (ordre de grandeur
-- USDA / CIQUAL). Idempotent : MERGE ... KEY(...) met à jour au lieu de dupliquer,
-- donc un redémarrage sur le fichier H2 existant ne viole pas la contrainte UNIQUE.
-- ============================================================================

MERGE INTO ingredient_nutrition (ingredient_code, name, calories_per_100g, proteins_g, carbs_g, fats_g)
    KEY (ingredient_code) VALUES
    ('EGG_WHOLE', 'Whole egg', 143, 12.6, 0.7, 9.5),
    ('FLOUR_WHEAT', 'Wheat flour', 364, 10.3, 76.3, 1.0),
    ('MILK_WHOLE', 'Whole milk', 61, 3.2, 4.8, 3.3),
    ('BUTTER', 'Butter', 717, 0.9, 0.1, 81.1),
    ('SUGAR', 'White sugar', 387, 0, 100, 0),
    ('TOMATO', 'Tomato', 18, 0.9, 3.9, 0.2),
    ('CHICKEN_BREAST', 'Chicken breast, raw', 120, 22.5, 0, 2.6),
    ('RICE_WHITE', 'White rice, raw', 365, 7.1, 80, 0.7),
    ('LEMON', 'Lemon', 29, 1.1, 9.3, 0.3),
    ('CREAM_HEAVY', 'Heavy cream', 340, 2.1, 2.8, 36.1),
    ('PASTA_DRY', 'Dry durum wheat pasta', 371, 13, 74.7, 1.5),
    ('WALNUT', 'Walnut', 654, 15.2, 13.7, 65.2),
    ('GORGONZOLA', 'Gorgonzola', 353, 21.4, 2.3, 28.7),
    ('OLIVE_OIL', 'Olive oil', 884, 0, 0, 100),
    ('MOZZARELLA', 'Mozzarella', 300, 22.2, 2.2, 22.4),
    ('PEANUT_BUTTER', 'Peanut butter', 588, 25, 20, 50),
    ('BREAD_WHEAT', 'Wheat bread', 265, 9, 49, 3.2),
    ('CHEESE_CHEDDAR', 'Cheddar cheese', 403, 24.9, 1.3, 33.1),
    ('YOGURT_PLAIN', 'Plain yogurt', 61, 3.5, 4.7, 3.3),
    ('HONEY', 'Honey', 304, 0.3, 82.4, 0),
    ('BANANA', 'Banana', 89, 1.1, 22.8, 0.3),
    ('OATS', 'Rolled oats', 389, 16.9, 66.3, 6.9),
    ('BLUEBERRY', 'Blueberry', 57, 0.7, 14.5, 0.3),
    ('CHOCOLATE_MILK', 'Milk chocolate', 535, 7.7, 59.4, 29.7),
    ('AVOCADO', 'Avocado', 160, 2, 8.5, 14.7),
    ('POTATO', 'Potato', 77, 2, 17.5, 0.1),
    ('TUNA_CANNED', 'Canned tuna in water', 116, 25.5, 0, 0.8),
    ('CUCUMBER', 'Cucumber', 15, 0.7, 3.6, 0.1);

-- Allergènes : 0, 1 ou plusieurs par ingrédient (CHOCOLATE_MILK en a deux ; TOMATO aucun).
MERGE INTO allergen_map (ingredient_id, allergen_name) KEY (ingredient_id, allergen_name)
SELECT n.id, a.allergen_name
FROM ingredient_nutrition n
JOIN (VALUES
    ('EGG_WHOLE', 'EGGS'),
    ('FLOUR_WHEAT', 'GLUTEN'),
    ('MILK_WHOLE', 'LACTOSE'),
    ('BUTTER', 'LACTOSE'),
    ('CREAM_HEAVY', 'LACTOSE'),
    ('PASTA_DRY', 'GLUTEN'),
    ('WALNUT', 'NUTS'),
    ('GORGONZOLA', 'LACTOSE'),
    ('MOZZARELLA', 'LACTOSE'),
    ('PEANUT_BUTTER', 'PEANUTS'),
    ('BREAD_WHEAT', 'GLUTEN'),
    ('CHEESE_CHEDDAR', 'LACTOSE'),
    ('YOGURT_PLAIN', 'LACTOSE'),
    ('OATS', 'GLUTEN'),
    ('CHOCOLATE_MILK', 'LACTOSE'),
    ('CHOCOLATE_MILK', 'SOY'),
    ('TUNA_CANNED', 'FISH')
) AS a (ingredient_code, allergen_name) ON a.ingredient_code = n.ingredient_code;
