# Saveur - Planificateur de repas et de recettes

🇫🇷 Français · [🇬🇧 English](README.md)

Saveur est une application web full-stack JavaScript de gestion de recettes, réalisée pour le projet d'examen :
frontend React, backend Node.js/Express, MongoDB avec Mongoose, API REST et utilisateurs authentifiés.

## Fonctionnalités principales

- Authentification par e-mail / mot de passe avec hachage bcrypt et sessions JWT
- Catalogue de recettes avec filtres par catégorie, difficulté et temps de cuisson
- Création de recettes personnelles avec ingrédients, quantités, unités et étapes de préparation
- Favoris de l'utilisateur et propriété publique/privée des recettes
- Planificateur de repas hebdomadaire par utilisateur authentifié
- Liste de courses intelligente générée à partir des recettes planifiées
- Compteurs du tableau de bord : recettes, favoris, repas planifiés et articles de courses

## Pile technique

- Frontend : React, TypeScript, Vite, Tailwind CSS
- Backend : Node.js, Express
- Base de données : MongoDB avec Mongoose
- Sécurité : bcryptjs, JSON Web Tokens

## Collections MongoDB

Le projet utilise plus de six collections NoSQL liées entre elles :

- `users`
- `categories`
- `ingredients`
- `recipes`
- `mealplans`
- `favorites`
- `shoppinglists`

## Installation

1. Installer les dépendances :

```bash
npm install
```

2. Créer le fichier d'environnement :

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

3. Vérifier que MongoDB tourne en local, ou modifier `MONGO_URI` dans `.env`.

4. Démarrer l'API backend :

```bash
npm run api
```

5. Démarrer le frontend dans un autre terminal :

```bash
npm run dev
```

Frontend : `http://localhost:3000`

Vérification de santé du backend : `http://localhost:5000/api/health`

## Exécution en local sous WSL

Prérequis : MongoDB 8.0 installé comme service systemd, Java 17+ (21 fonctionne), Maven, Node 22.
Ouvrir un terminal par service (les étapes 2 à 4 gardent chacune un processus au premier plan).

1. **MongoDB** (service système) :

```bash
sudo systemctl start mongod
```

Vérification : `systemctl is-active mongod` affiche `active`, et `mongosh --quiet --eval 'db.runCommand({ping:1}).ok'` affiche `1`.

2. **Base nutritionnelle legacy** (service SOAP Spring Boot, facultatif : Saveur fonctionne sans lui) :

```bash
cd legacy-nutritional-db && mvn spring-boot:run
```

3. **API Saveur** (nécessite un `.env` avec `MONGO_URI=mongodb://127.0.0.1:27017/saveur`, voir `.env.example`) :

```bash
npm install && npm run api
```

4. **Frontend** :

```bash
npm run dev
```

| Quoi | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Vérification de santé de l'API | http://localhost:5000/api/health |
| WSDL SOAP | http://localhost:8080/ws/mon-service.wsdl |
| Endpoint SOAP | http://localhost:8080/ws |
| Console H2 (base SQL legacy) | http://localhost:8080/h2-console |

Consulter la nutrition enregistrée de la dernière recette :

```bash
mongosh --quiet saveur --eval 'printjson(db.recipes.find({}, {title:1, nutrition:1}).sort({createdAt:-1}).limit(1).toArray())'
```

## Connexion de démonstration

Le backend charge automatiquement des données de démonstration lorsque la base est vide.

- E-mail : `chef@saveur.local`
- Mot de passe : `saveur123`

Compte administrateur de démonstration :

- E-mail : `admin@saveur.local`
- Mot de passe : `admin12345`

## Aperçu de l'API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `GET /api/ingredients`
- `GET /api/recipes`
- `POST /api/recipes`
- `GET /api/recipes/mine`
- `POST /api/recipes/:id/nutrition/refresh` (recalcule la nutrition à partir du service SOAP legacy)
- `GET /api/favorites`
- `POST /api/favorites/:recipeId/toggle`
- `GET /api/meal-plans`
- `POST /api/meal-plans`
- `GET /api/groceries`
- `GET /api/dashboard`

## Nutrition via le service SOAP legacy (`legacy-nutritional-db/`)

Saveur (Node.js / REST / MongoDB) enrichit chaque recette avec des valeurs nutritionnelles issues d'un **système
legacy** : un service SOAP Spring Boot adossé à une base SQL (« Base Nutritionnelle »). Le contrat SOAP est
écrit en premier (XSD) ; le WSDL et les classes Java en sont générés.

### Architecture

```
 UI React ──REST──▶ Contrôleur Express ──▶ nutritionService ──▶ nutritionSoapClient ══SOAP/XML══▶ @Endpoint Spring-WS
 (NutritionCard)    (recipeController)     (orchestration,      (adaptateur fin :        HTTP       (NutritionEndpoint)
                          │                 ni HTTP, ni XML)     lib soap, XML→JSON)                    │ NutritionService
                          ▼                       │                                                   ▼ Spring Data JPA
                    Mongoose / MongoDB     nutritionCalculator                                  H2 (SQL) : ingredient_nutrition,
                    Recipe.nutrition       (pur : conversion en g, totaux)                                 allergen_map
```

| Couche | Fichier | Responsabilité |
| --- | --- | --- |
| Adaptateur SOAP | `server/services/nutritionSoapClient.js` | `createClientAsync` + `getNutritionalValuesAsync`, objet issu du XML → JSON propre, fautes / erreurs de transport → erreurs typées. **Aucune logique métier.** |
| Calcul | `server/services/nutritionCalculator.js` | Fonctions pures : unité → grammes, totaux, par portion, allergènes. |
| Orchestration | `server/services/nutritionService.js` | Résout les codes (modèle `Ingredient` existant), UN seul appel SOAP, gestion des fautes, ne lève jamais d'exception. |
| Persistance | `server/controllers/recipeController.js`, `server/models/Recipe.js` | Contrôleur / modèle existants ; sous-document `nutrition` ajouté. |
| Contrat | `legacy-nutritional-db/src/main/resources/xsd/nutrition.xsd` | Source de vérité du WSDL, des classes JAXB et de la validation. |

### Lancer le serveur Spring Boot legacy (Java 17+, Maven)

```bash
cd legacy-nutritional-db
mvn spring-boot:run            # ou : mvn clean package && java -jar target/legacy-nutritional-db-1.0.0.jar
```

- WSDL : **http://localhost:8080/ws/mon-service.wsdl** (endpoint SOAP : `http://localhost:8080/ws`)
- Console H2 : `http://localhost:8080/h2-console`, URL JDBC `jdbc:h2:file:./data/nutrition-db;AUTO_SERVER=TRUE`, utilisateur `sa`, mot de passe vide
- Le fichier H2 se trouve dans `legacy-nutritional-db/data/` (ignoré par git). `schema.sql` / `data.sql` sont idempotents : redémarrer est sans risque.
- `mvn clean package` génère les classes JAXB depuis le XSD dans `target/generated-sources/jaxb/bi/upg/nutrition/generated/` et exécute les tests de l'endpoint.

### Lancer Saveur avec la fonctionnalité nutrition

```bash
cp .env.example .env     # NUTRITION_WSDL_URL=http://localhost:8080/ws/mon-service.wsdl
npm install
npm run api              # MongoDB doit tourner
npm run dev              # frontend
```

Spring Boot est **facultatif à l'exécution** : sans lui, les recettes sont quand même créées, avec `nutrition.status = "unavailable"`.
`POST /api/recipes/:id/nutrition/refresh` (propriétaire / admin) recalcule la nutrition une fois le service rétabli.

Exemples de requêtes/réponses SOAP (appels réels) : `soap-tests/` (collection Postman + fichiers XML bruts).

```bash
curl -s -H 'Content-Type: text/xml; charset=utf-8' --data @soap-tests/request-valid.xml http://localhost:8080/ws
```

### Contrat : correspondance des types (SQL ↔ XSD ↔ Java ↔ JSON ↔ Mongoose)

| Colonne SQL | Type XSD (`http://upg.bi/nutrition`) | Java (JAXB, généré) | JSON Node (sortie de l'adaptateur) | Mongoose |
| --- | --- | --- | --- | --- |
| `ingredient_nutrition.id` BIGINT PK auto-incrément | `DatabaseIdType` = `xsd:long`, min 1 | `long` | `databaseId: number` | non stocké |
| `ingredient_code` VARCHAR(50) UNIQUE | `IngredientCodeType` = `xsd:string`, 1..50, pattern `[A-Z0-9_]+` | `String` | `code: string` | `Ingredient.nutritionCode: String` |
| `name` VARCHAR(100) | `IngredientNameType` = `xsd:string`, 1..100 | `String` | `name: string` | non stocké |
| `calories_per_100g` DECIMAL(7,2) | `CaloriesPer100gType` = `xsd:decimal`, totalDigits 7, fractionDigits 2, 0..900 | `BigDecimal` | `caloriesPer100g: number` | `Recipe.nutrition.totalCalories: Number` (calculé) |
| `proteins_g` DECIMAL(5,2) | `MacroNutrientGramsType` = `xsd:decimal`, totalDigits 5, fractionDigits 2, 0..100 | `BigDecimal` | `proteins: number` | `totalProteins: Number` |
| `carbs_g` DECIMAL(5,2) | `MacroNutrientGramsType` | `BigDecimal` | `carbs: number` | `totalCarbs: Number` |
| `fats_g` DECIMAL(5,2) | `MacroNutrientGramsType` | `BigDecimal` | `fats: number` | `totalFats: Number` |
| `publisher` VARCHAR(100) NOT NULL (défaut `'Saveur demo dataset'`) | `PublisherType` = `xsd:string`, 1..100 | `String` | `publisher: string \| null` | non stocké |
| `allergen_map.allergen_name` VARCHAR(50) + `CHECK IN (...)` (FK `ingredient_id` → `ingredient_nutrition.id`) | `AllergenNameType` = énumération (14 allergènes UE), listée dans `AllergenListType` (`allergen` 0..unbounded) | `enum AllergenNameType` | `allergens: string[]` (toujours un tableau) | `nutrition.allergens: [String]` (uniques, triés) |
| liste de la requête | `GetNutritionalValuesRequestType` : `ingredientCode` **minOccurs 1, maxOccurs unbounded** | `List<String>` | `{ ingredientCode: string[] }` | — |

Les restrictions XSD reprennent les contraintes SQL (plages des `CHECK`, `DECIMAL(p,s)`, `VARCHAR(n)`), et le service **valide les
requêtes comme les réponses contre le XSD** (`PayloadValidatingInterceptor`). La faute possède son propre élément typé
(`getNutritionalValuesFault`) : le WSDL contient donc un vrai `wsdl:fault`.

### Décisions de conception et hypothèses

- **Colonne `publisher`** : l'énoncé place une colonne `publisher VARCHAR` sur `ingredient_nutrition`. Nous l'interprétons comme l'**éditeur / la source des valeurs nutritionnelles** de chaque ligne ; elle est stockée en `VARCHAR(100) NOT NULL` et renvoyée dans chaque `<ingredient>` de la réponse SOAP sous le nom `publisher` (`xsd:string`, `PublisherType`). Les 12 lignes copiées de l'USDA portent `USDA FoodData Central (SR Legacy)` ; les 28 lignes d'origine portent `Saveur demo dataset`. L'adaptateur Node la transmet telle quelle (`publisher`, `null` si un ancien service l'omet) ; elle n'est pas stockée dans MongoDB. `carbs_g` et `fats_g` ont été **ajoutées** car elles sont exigées en sortie.
- **`databaseId` (xsd:long) supplémentaire** dans chaque résultat pour que la clé BIGINT apparaisse dans le contrat ; `ingredientId` porte la clé métier `ingredient_code`, comme demandé.
- **La liste des allergènes est une énumération** (14 allergènes UE, `LACTOSE` = famille du lait, `NUTS` = fruits à coque, comme dans l'énoncé) avec un `CHECK` SQL équivalent, de sorte que XSD et SQL restent équivalents.
- **Types nommés partout** (qualité du contrat). Comme les types nommés n'ont pas de `@XmlRootElement`, l'endpoint échange des `JAXBElement<…>` construits avec l'`ObjectFactory` générée.
- **Jeu de données** : 40 ingrédients (plus que les « ~15 » demandés), afin que les recettes de démonstration de Saveur et les recettes courantes obtiennent une nutrition complète ; 0, 1 et 2 allergènes sont tous représentés (par ex. `TOMATO` aucun, `FLOUR_WHEAT` un, `CHOCOLATE_MILK` deux). Les 28 lignes d'origine sont des ordres de grandeur et **ne proviennent pas de FDC** ; les 12 lignes ajoutées ensuite sont copiées de USDA FoodData Central (voir « Jeu de données legacy : sources USDA »). Données de démonstration, pas des données médicales. `XYZ` et `Saffron` sont volontairement absents pour que la démonstration du `<soap:Fault>` continue de fonctionner.
- **Code inconnu = `<soap:Fault>` (faultcode `Client`), tout ou rien** — choisi plutôt que « les codes valides + une liste de codes inconnus », car l'énoncé demande une vraie faute et une faute est la façon standard en SOAP de signaler une requête erronée. La faute liste *tous* les codes inconnus dans le faultstring et dans un `<detail>` typé.
  Traitement côté Saveur : **enregistrer la recette avec une nutrition partielle + un avertissement** (HTTP 201, `status: "partial"`, l'ingrédient listé dans `skippedIngredients`), plutôt qu'une erreur 4xx — un nom d'ingrédient inconnu saisi par un utilisateur (par ex. « Saffron ») ne doit pas empêcher la création de la recette. Implémentation : en cas de faute client, les codes inconnus lus dans le détail de la faute sont retirés et l'appel est réessayé **une seule fois** (le seul cas avec deux appels SOAP). Les autres fautes (par ex. erreurs de validation XSD) → `unavailable`.
- **Service arrêté / injoignable / délai dépassé / WSDL non chargeable** → la recette est créée avec `nutrition.status = "unavailable"` + `unavailableReason`, un avertissement est journalisé, aucune exception ne s'échappe. Les délais (`NUTRITION_TIMEOUT_MS`, 5000 ms par défaut) s'appliquent au chargement du WSDL et à chaque appel. Le client SOAP est mis en cache sous forme de **promesse** et le cache est vidé lorsque le chargement échoue : un Spring Boot démarré *après* Node est donc pris en compte à la requête suivante, sans redémarrer Node.
- **Recettes sans nutrition** : `Recipe.nutrition` vaut `null` par défaut (pas des zéros) ; les anciennes recettes se chargent sans modification et l'interface n'affiche rien pour elles. `POST …/nutrition/refresh` n'écrase jamais une nutrition enregistrée par un marqueur « unavailable » (il répond HTTP 503), alors que créer ou modifier (PUT) une recette pendant une panne enregistre `unavailable`, car les ingrédients ont changé et les anciennes valeurs seraient fausses.
- **Ingrédient ↔ code legacy** : `Ingredient.nutritionCode` (facultatif). Il est renseigné par `server/utils/nutritionCodes.js` : correspondance explicite pour les noms Saveur qui diffèrent des codes legacy (`Tomatoes → TOMATO`, `Flour → FLOUR_WHEAT`, `Eggs → EGG_WHOLE`…), sinon un code dérivé en majuscules (`Olive oil → OLIVE_OIL`). Les ingrédients existants reçoivent un code à leur prochaine utilisation ; un code saisi à la main n'est jamais écrasé.
- **Tous les codes en UN seul appel**, dédoublonnés avant l'envoi ; le serveur dédoublonne aussi et répond dans l'ordre de la requête.

#### Conversion des unités en grammes (`nutritionCalculator.js`)

| Unité(s) | Règle |
| --- | --- |
| `mg`, `g`, `kg`, `oz`, `lb` | exact (oz = 28,3495 g, lb = 453,592 g) |
| `ml`, `cl`, `dl`, `l`, `tsp` (5 ml), `tbsp` (15 ml), `cup` (240 ml) | converti en ml, puis **1 ml = 1 g** (densité de l'eau — une approximation pour l'huile, le miel, le lait…) |
| `piece`, `pcs`, `unit`, `slice`, `whole`, `clove`, `bunch`… | grammes par pièce, la première source disponible l'emporte : `Ingredient.gramsPerUnit` (renseigné sur le document) → **table USDA par code legacy** (`server/utils/gramsPerPiece.js`, valeurs ci-dessous) → **100 g, signalé comme estimation** dans `warnings`. **`pcs` d'ail signifie UNE GOUSSE (3 g), pas une tête.** |
| `pinch` (0,4 g), `dash` (0,6 g) | petits poids fixes, signalés comme estimations |
| tout le reste | ingrédient **ignoré et signalé** dans `skippedIngredients` (non fatal) |

Autres règles : les ingrédients optionnels **sont inclus** dans les totaux ; seuls les totaux finaux sont arrondis (1 décimale) ; `perServing = total / servings` ; le statut est `complete` (tout est compté), `partial` (quelque chose a été ignoré) ou `unavailable` (rien n'a pu être calculé).

**Indicateur d'approximation.** `nutrition.approximate` (un booléen, indépendant de `status`) vaut `true` lorsqu'au moins un ingrédient compté n'a **pas** été donné en masse exacte (`mg`/`g`/`kg`/`oz`/`lb`) ni en volume ml/l (`ml`/`cl`/`dl`/`l`) : c'est-à-dire lorsqu'il provient d'une unité comptée (`pcs`…), de `tsp`/`tbsp`/`cup`, de `pinch`/`dash`, ou du poids par défaut de 100 g. Une recette peut être `complete` **et** approximative. La carte nutrition préfixe alors les valeurs par portion et totales par « ≈ » et ajoute une note. Les recettes enregistrées avant l'existence de ce champ valent `approximate: false` tant qu'elles ne sont pas recalculées.

#### Jeu de données legacy : sources USDA

Source : USDA FoodData Central, **SR Legacy (avril 2018)**, téléchargé sous la forme `FoodData_Central_sr_legacy_food_json_2018-04.zip` depuis `fdc.nal.usda.gov/fdc-datasets/` (la `DEMO_KEY` de l'API était limitée en débit). Les lignes de `data.sql` et les tableaux ci-dessous ont été générés par une seule extraction sur ce fichier (kcal = nutriment 208, protéines 203, glucides 205, lipides 204). Le poids par pièce provient du même aliment USDA que les valeurs pour 100 g lorsque la ligne vient de FDC ; le libellé de la portion est cité exactement. Lorsque l'USDA n'a pas de portion « medium » (mangue, plantain, citron, concombre, avocat, pain), le libellé réellement utilisé est celui indiqué.

Lignes ajoutées à la base legacy (`MERGE` : les lignes existantes ne sont pas touchées) :

| Code | Aliment USDA (SR Legacy) | ID FDC | kcal / protéines / glucides / lipides pour 100 g | Grammes par pièce |
|---|---|---|---|---|
| `ONION` | Onions, raw | 170000 | 40 / 1.1 / 9.34 / 0.1 | 110 g — `medium (2-1/2" dia)` |
| `GREEN_PEPPER` | Peppers, sweet, green, raw | 170427 | 20 / 0.86 / 4.64 / 0.17 | 119 g — `medium (approx 2-3/4" long, 2-1/2" dia)` |
| `BELL_PEPPER` | Peppers, sweet, red, raw | 170108 | 26 / 0.99 / 6.03 / 0.3 | 119 g — `medium (approx 2-3/4" long, 2-1/2 dia.)` |
| `GARLIC` | Garlic, raw | 169230 | 149 / 6.36 / 33.1 / 0.5 | 3 g — `clove` |
| `CARROT` | Carrots, raw | 170393 | 41 / 0.93 / 9.58 / 0.24 | 61 g — `medium` |
| `SALT` | Salt, table | 173468 | 0 / 0 / 0 / 0 | — |
| `BEEF` | Beef, ground, 85% lean meat / 15% fat, raw | 171796 | 215 / 18.6 / 0 / 15 | — |
| `MANGO` | Mangos, raw | 169910 | 60 / 0.82 / 15 / 0.38 | 336 g — `fruit without refuse` |
| `PLANTAIN` | Plantains, yellow, raw | 169130 | 122 / 1.3 / 31.9 / 0.35 | 270 g — `plantain` |
| `CORN` | Corn, sweet, yellow, raw | 169998 | 86 / 3.27 / 18.7 / 1.35 | 102 g — `ear, medium (6-3/4" to 7-1/2" long) yields` |
| `BASIL` | Basil, fresh | 172232 | 23 / 3.15 / 2.65 / 0.64 | — |
| `LETTUCE` | Lettuce, green leaf, raw | 169249 | 15 / 1.36 / 2.87 / 0.15 | — |

Aucun de ces 12 aliments n'est l'un des 14 allergènes UE : ils n'ont donc **aucune ligne dans `allergen_map`** (voulu, pas un oubli).

Déjà présents (non rajoutés) : `POTATO`, `BUTTER`, `OLIVE_OIL`, `SUGAR`, `MILK_WHOLE` (« Milk » y correspond), `CHICKEN_BREAST` (« Chicken »).

Poids par pièce pour les lignes legacy préexistantes (pris sur l'aliment USDA correspondant) :

| Code | ID FDC | Portion USDA | Grammes |
|---|---|---|---|
| `EGG_WHOLE` | 171287 | `medium` | 44 |
| `TOMATO` | 170457 | `medium whole (2-3/5" dia)` | 123 |
| `POTATO` | 170026 | `Potato medium (2-1/4" to 3-1/4" dia)` | 213 |
| `LEMON` | 167746 | `fruit (2-1/8" dia)` | 58 |
| `BANANA` | 173944 | `medium (7" to 7-7/8" long)` | 118 |
| `AVOCADO` | 171705 | `avocado, NS as to Florida or California` | 201 |
| `CUCUMBER` | 168409 | `cucumber (8-1/4")` | 301 |
| `BREAD_WHEAT` | 172688 | `slice` | 32 |

Remarques : l'ail vaut **3 g par gousse** (USDA) et non les ~5 g souvent cités ; le poids de l'œuf est celui de l'œuf **moyen** USDA (44 g), et non d'un gros œuf (50 g) ; `Plantain` utilise l'unique portion `plantain` de l'USDA (270 g) et `Mango` sa portion `fruit without refuse` (336 g).

#### Comment les nouvelles lignes arrivent dans un fichier H2 existant

`application.properties` définit `spring.sql.init.mode=always` : Spring exécute donc `schema.sql` et `data.sql` à **chaque** démarrage, y compris sur un `data/nutrition-db.mv.db` existant. `schema.sql` ne contient que des `CREATE TABLE IF NOT EXISTS` ; `data.sql` utilise `MERGE INTO … KEY (ingredient_code)` (et `KEY (ingredient_id, allergen_name)` pour les allergènes) : un code absent est **inséré**, un code existant est **mis à jour sur place** (son `id` est conservé : pas d'erreur de clé dupliquée ni de rupture de clé étrangère). La colonne `publisher` ayant été ajoutée ensuite, `schema.sql` exécute aussi `ALTER TABLE ingredient_nutrition ADD COLUMN IF NOT EXISTS publisher …` (sans effet sur un fichier neuf ou déjà migré) : un fichier H2 existant reçoit la colonne au démarrage suivant, ses lignes prennent la valeur par défaut, puis `data.sql` met le bon éditeur sur chaque ligne. `mvn clean` ne touche jamais à `legacy-nutritional-db/data/`. Limite : `MERGE` ne **supprime** jamais ; retirer une ligne de `data.sql` ne la retire donc pas d'un fichier existant (supprimer le fichier, ou lancer un `DELETE` explicite, pour réinitialiser).

### Tests

- `legacy-nutritional-db` : `mvn clean package` (tests de l'endpoint avec `MockWebServiceClient` : requête valide, doublons, faute listant tous les codes inconnus, violations du XSD, nouveaux codes USDA, `XYZ`/`SAFFRON` toujours inconnus).
- Saveur : `npm test` (vitest — conversion d'unités, poids par pièce USDA, indicateur `approximate`, totaux, normalisation XML→JSON, gestion de la faute / de l'indisponibilité, recréation du client, rendu de `NutritionCard` avec et sans « ≈ ») et `npm run lint`.
