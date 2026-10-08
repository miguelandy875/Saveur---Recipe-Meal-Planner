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

-- ============================================================================
-- Ingrédients courants ajoutés ensuite. Valeurs COPIÉES de USDA FoodData Central, base "SR Legacy"
-- (2018-04), pour 100 g : kcal (nutriment 208), protéines (203), glucides (205), lipides (204).
-- Chaque ligne = un aliment USDA (identifiants FDC dans le README). Aucune n'a d'allergène parmi
-- les 14 allergènes UE : il n'y a donc volontairement aucune ligne dans allergen_map pour elles.
-- Même mécanisme idempotent : au prochain démarrage sur le fichier H2 existant, MERGE ... KEY
-- INSÈRE les codes absents et met à jour les autres (les ids existants sont conservés).
-- ============================================================================
MERGE INTO ingredient_nutrition (ingredient_code, name, calories_per_100g, proteins_g, carbs_g, fats_g)
    KEY (ingredient_code) VALUES
    ('ONION', 'Onion', 40, 1.1, 9.34, 0.1),
    ('GREEN_PEPPER', 'Green bell pepper', 20, 0.86, 4.64, 0.17),
    ('BELL_PEPPER', 'Red bell pepper', 26, 0.99, 6.03, 0.3),
    ('GARLIC', 'Garlic', 149, 6.36, 33.1, 0.5),
    ('CARROT', 'Carrot', 41, 0.93, 9.58, 0.24),
    ('SALT', 'Table salt', 0, 0, 0, 0),
    ('BEEF', 'Ground beef 85% lean, raw', 215, 18.6, 0, 15),
    ('MANGO', 'Mango', 60, 0.82, 15, 0.38),
    ('PLANTAIN', 'Plantain, yellow', 122, 1.3, 31.9, 0.35),
    ('CORN', 'Sweet corn, yellow', 86, 3.27, 18.7, 1.35),
    ('BASIL', 'Basil, fresh', 23, 3.15, 2.65, 0.64),
    ('LETTUCE', 'Green leaf lettuce', 15, 1.36, 2.87, 0.15);
