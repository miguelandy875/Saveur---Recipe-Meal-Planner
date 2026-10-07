-- ============================================================================
-- Schéma SQL de la base nutritionnelle "legacy" (H2, mode fichier).
-- Idempotent : exécuté à CHAQUE démarrage (spring.sql.init.mode=always), il ne
-- recrée rien si les tables existent déjà (le fichier H2 survit aux redémarrages).
-- Les contraintes CHECK reprennent les restrictions de nutrition.xsd.
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingredient_nutrition (
    id                 BIGINT        AUTO_INCREMENT PRIMARY KEY,
    ingredient_code    VARCHAR(50)   NOT NULL,
    name               VARCHAR(100)  NOT NULL,
    calories_per_100g  DECIMAL(7,2)  NOT NULL,
    proteins_g         DECIMAL(5,2)  NOT NULL,
    carbs_g            DECIMAL(5,2)  NOT NULL, -- absent de la spec d'origine mais exigé en sortie
    fats_g             DECIMAL(5,2)  NOT NULL, -- idem
    CONSTRAINT uk_ingredient_code UNIQUE (ingredient_code),
    CONSTRAINT ck_calories CHECK (calories_per_100g >= 0 AND calories_per_100g <= 900),
    CONSTRAINT ck_proteins CHECK (proteins_g >= 0 AND proteins_g <= 100),
    CONSTRAINT ck_carbs    CHECK (carbs_g    >= 0 AND carbs_g    <= 100),
    CONSTRAINT ck_fats     CHECK (fats_g     >= 0 AND fats_g     <= 100)
    -- La colonne "publisher VARCHAR" de l'énoncé est volontairement omise (voir README).
);

CREATE TABLE IF NOT EXISTS allergen_map (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    ingredient_id  BIGINT       NOT NULL,
    allergen_name  VARCHAR(50)  NOT NULL,
    CONSTRAINT fk_allergen_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient_nutrition (id),
    CONSTRAINT uk_allergen_per_ingredient UNIQUE (ingredient_id, allergen_name),
    CONSTRAINT ck_allergen_name CHECK (allergen_name IN (
        'GLUTEN', 'CRUSTACEANS', 'EGGS', 'FISH', 'PEANUTS', 'SOY', 'LACTOSE',
        'NUTS', 'CELERY', 'MUSTARD', 'SESAME', 'SULPHITES', 'LUPIN', 'MOLLUSCS'))
);
