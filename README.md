# Saveur - Recipe Meal Planner

[🇫🇷 Français](README.fr.md) · 🇬🇧 English

Saveur is a JavaScript full-stack recipe web application built for the exam project:
frontend React, backend Node.js/Express, MongoDB with Mongoose, REST APIs, and authenticated users.

## Main Features

- Email/password authentication with bcrypt password hashing and JWT sessions
- Recipe catalog with filters by category, difficulty and cooking time
- Personal recipe creation with ingredients, quantities, units and preparation steps
- User favorites and private/public recipe ownership
- Weekly meal planner by authenticated user
- Smart grocery list generated from planned recipes
- Dashboard counters for recipes, favorites, planned meals and grocery items

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Security: bcryptjs, JSON Web Tokens

## MongoDB Collections

The project uses more than six related NoSQL collections:

- `users`
- `categories`
- `ingredients`
- `recipes`
- `mealplans`
- `favorites`
- `shoppinglists`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Make sure MongoDB is running locally, or update `MONGO_URI` in `.env`.

4. Start the backend API:

```bash
npm run api
```

5. Start the frontend in another terminal:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend health check: `http://localhost:5000/api/health`

## Run locally on WSL

Prerequisites: MongoDB 8.0 installed as a systemd service, Java 17+ (21 works), Maven, Node 22.
Open one terminal per service (steps 2 to 4 each keep a process in the foreground).

1. **MongoDB** (system service):

```bash
sudo systemctl start mongod
```

Check: `systemctl is-active mongod` prints `active`, and `mongosh --quiet --eval 'db.runCommand({ping:1}).ok'` prints `1`.

2. **Legacy nutritional database** (Spring Boot SOAP service, optional: Saveur still works without it):

```bash
cd legacy-nutritional-db && mvn spring-boot:run
```

3. **Saveur API** (needs `.env` with `MONGO_URI=mongodb://127.0.0.1:27017/saveur`, see `.env.example`):

```bash
npm install && npm run api
```

4. **Frontend**:

```bash
npm run dev
```

| What | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API health check | http://localhost:5000/api/health |
| SOAP WSDL | http://localhost:8080/ws/mon-service.wsdl |
| SOAP endpoint | http://localhost:8080/ws |
| H2 console (legacy SQL database) | http://localhost:8080/h2-console |

Inspect the stored nutrition of the latest recipe:

```bash
mongosh --quiet saveur --eval 'printjson(db.recipes.find({}, {title:1, nutrition:1}).sort({createdAt:-1}).limit(1).toArray())'
```

## Demo Login

The backend seeds demo data automatically when the database is empty.

- Email: `chef@saveur.local`
- Password: `saveur123`

Admin demo:

- Email: `admin@saveur.local`
- Password: `admin12345`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `GET /api/ingredients`
- `GET /api/recipes`
- `POST /api/recipes`
- `GET /api/recipes/mine`
- `POST /api/recipes/:id/nutrition/refresh` (recompute the nutrition from the legacy SOAP service)
- `GET /api/favorites`
- `POST /api/favorites/:recipeId/toggle`
- `GET /api/meal-plans`
- `POST /api/meal-plans`
- `GET /api/groceries`
- `GET /api/dashboard`

## Nutrition via the legacy SOAP service (`legacy-nutritional-db/`)

Saveur (Node.js / REST / MongoDB) enriches each recipe with nutritional values coming from a **legacy
system**: a Spring Boot SOAP service backed by a SQL database ("Base Nutritionnelle"). The SOAP contract is
written first (XSD), the WSDL and the Java classes are generated from it.

### Architecture

```
 React UI ──REST──▶ Express controller ──▶ nutritionService ──▶ nutritionSoapClient ══SOAP/XML══▶ Spring-WS @Endpoint
 (NutritionCard)    (recipeController)     (orchestration,      (thin adapter:          HTTP       (NutritionEndpoint)
                          │                 no HTTP, no XML)     soap lib, XML→JSON)                    │ NutritionService
                          ▼                       │                                                   ▼ Spring Data JPA
                    Mongoose / MongoDB     nutritionCalculator                                  H2 (SQL): ingredient_nutrition,
                    Recipe.nutrition       (pure: g conversion, totals)                                    allergen_map
```

| Layer | File | Responsibility |
| --- | --- | --- |
| SOAP adapter | `server/services/nutritionSoapClient.js` | `createClientAsync` + `getNutritionalValuesAsync`, XML-derived object → clean JSON, faults/transport errors → typed errors. **No business logic.** |
| Computation | `server/services/nutritionCalculator.js` | Pure functions: unit → grams, totals, per serving, allergens. |
| Orchestration | `server/services/nutritionService.js` | Resolves codes (existing `Ingredient` model), ONE SOAP call, fault handling, never throws. |
| Persistence | `server/controllers/recipeController.js`, `server/models/Recipe.js` | Existing controller/model; `nutrition` subdocument added. |
| Contract | `legacy-nutritional-db/src/main/resources/xsd/nutrition.xsd` | Source of truth for WSDL, JAXB classes and validation. |

### Run the legacy Spring Boot server (Java 17+, Maven)

```bash
cd legacy-nutritional-db
mvn spring-boot:run            # or: mvn clean package && java -jar target/legacy-nutritional-db-1.0.0.jar
```

- WSDL: **http://localhost:8080/ws/mon-service.wsdl** (SOAP endpoint: `http://localhost:8080/ws`)
- H2 console: `http://localhost:8080/h2-console`, JDBC URL `jdbc:h2:file:./data/nutrition-db;AUTO_SERVER=TRUE`, user `sa`, empty password
- The H2 file lives in `legacy-nutritional-db/data/` (git-ignored). `schema.sql` / `data.sql` are idempotent, so restarting is safe.
- `mvn clean package` generates the JAXB classes from the XSD into `target/generated-sources/jaxb/bi/upg/nutrition/generated/` and runs the endpoint tests.

### Run Saveur with the nutrition feature

```bash
cp .env.example .env     # NUTRITION_WSDL_URL=http://localhost:8080/ws/mon-service.wsdl
npm install
npm run api              # MongoDB must be running
npm run dev              # frontend
```

Spring Boot is **optional at runtime**: without it, recipes are still created, with `nutrition.status = "unavailable"`.
`POST /api/recipes/:id/nutrition/refresh` (owner/admin) recomputes the nutrition once the service is back.

SOAP request/response samples (real calls): `soap-tests/` (Postman collection + raw XML files).

```bash
curl -s -H 'Content-Type: text/xml; charset=utf-8' --data @soap-tests/request-valid.xml http://localhost:8080/ws
```

### Contract: type mapping (SQL ↔ XSD ↔ Java ↔ JSON ↔ Mongoose)

| SQL column | XSD type (`http://upg.bi/nutrition`) | Java (JAXB, generated) | Node JSON (adapter output) | Mongoose |
| --- | --- | --- | --- | --- |
| `ingredient_nutrition.id` BIGINT PK auto-increment | `DatabaseIdType` = `xsd:long`, min 1 | `long` | `databaseId: number` | not stored |
| `ingredient_code` VARCHAR(50) UNIQUE | `IngredientCodeType` = `xsd:string`, 1..50, pattern `[A-Z0-9_]+` | `String` | `code: string` | `Ingredient.nutritionCode: String` |
| `name` VARCHAR(100) | `IngredientNameType` = `xsd:string`, 1..100 | `String` | `name: string` | not stored |
| `calories_per_100g` DECIMAL(7,2) | `CaloriesPer100gType` = `xsd:decimal`, totalDigits 7, fractionDigits 2, 0..900 | `BigDecimal` | `caloriesPer100g: number` | `Recipe.nutrition.totalCalories: Number` (computed) |
| `proteins_g` DECIMAL(5,2) | `MacroNutrientGramsType` = `xsd:decimal`, totalDigits 5, fractionDigits 2, 0..100 | `BigDecimal` | `proteins: number` | `totalProteins: Number` |
| `carbs_g` DECIMAL(5,2) | `MacroNutrientGramsType` | `BigDecimal` | `carbs: number` | `totalCarbs: Number` |
| `fats_g` DECIMAL(5,2) | `MacroNutrientGramsType` | `BigDecimal` | `fats: number` | `totalFats: Number` |
| `publisher` VARCHAR(100) NOT NULL (default `'Saveur demo dataset'`) | `PublisherType` = `xsd:string`, 1..100 | `String` | `publisher: string \| null` | not stored |
| `allergen_map.allergen_name` VARCHAR(50) + `CHECK IN (...)` (FK `ingredient_id` → `ingredient_nutrition.id`) | `AllergenNameType` = enumeration (14 EU allergens), listed in `AllergenListType` (`allergen` 0..unbounded) | `enum AllergenNameType` | `allergens: string[]` (always an array) | `nutrition.allergens: [String]` (unique, sorted) |
| request list | `GetNutritionalValuesRequestType`: `ingredientCode` **minOccurs 1, maxOccurs unbounded** | `List<String>` | `{ ingredientCode: string[] }` | — |

XSD restrictions repeat the SQL constraints (`CHECK` ranges, `DECIMAL(p,s)`, `VARCHAR(n)`), and the service **validates both
requests and responses against the XSD** (`PayloadValidatingInterceptor`). The fault has its own typed element
(`getNutritionalValuesFault`) so the WSDL contains a real `wsdl:fault`.

### Design decisions and assumptions

- **`publisher` column**: the brief lists a `publisher VARCHAR` column on `ingredient_nutrition`. We interpret it as the **publisher / source of the nutritional values** of each row, stored as `VARCHAR(100) NOT NULL` and returned in every `<ingredient>` of the SOAP response as `publisher` (`xsd:string`, `PublisherType`). The 12 rows copied from USDA carry `USDA FoodData Central (SR Legacy)`; the 28 original rows carry `Saveur demo dataset`. The Node adapter passes it through (`publisher`, `null` if an older service omits it); it is not stored in MongoDB. `carbs_g` and `fats_g` were **added** because they are required in the output.
- **Extra `databaseId` (xsd:long)** in each result so that the BIGINT key appears in the contract; `ingredientId` carries the business key `ingredient_code` as requested.
- **Allergen list is an enumeration** (EU 14 allergens, `LACTOSE` = milk family, `NUTS` = tree nuts, as in the brief) with a matching SQL `CHECK`, so XSD and SQL stay equivalent.
- **Named types everywhere** (contract quality). Because named types have no `@XmlRootElement`, the endpoint exchanges `JAXBElement<…>` built with the generated `ObjectFactory`.
- **Seed**: 40 ingredients (more than the "~15" asked) so that the Saveur seed recipes and common home recipes get full nutrition; 0, 1 and 2 allergens are all represented (e.g. `TOMATO` none, `FLOUR_WHEAT` one, `CHOCOLATE_MILK` two). The original 28 rows are order-of-magnitude figures and are **not FDC-sourced**; the 12 rows added later are copied from USDA FoodData Central (see "Legacy seed: USDA sources"). Demo data, not medical data. `XYZ` and `Saffron` are deliberately absent so the `<soap:Fault>` demo keeps working.
- **Unknown code = `<soap:Fault>` (faultcode `Client`), all-or-nothing** — chosen over "valid ones + list of unknown codes" because the brief asks for a proper fault and a fault is the standard SOAP way to signal a bad request. The fault lists *every* unknown code in the faultstring and in a typed `<detail>`.
  Saveur's handling: **save the recipe with partial nutrition + a warning** (HTTP 201, `status: "partial"`, the ingredient listed in `skippedIngredients`), instead of a 4xx — an unknown ingredient name typed by a user (e.g. "Saffron") must not block recipe creation. Implementation: on a client fault, the unknown codes read from the fault detail are removed and the call is retried **once** (the only case with two SOAP calls). Other faults (e.g. XSD validation errors) → `unavailable`.
- **Service down / unreachable / timeout / WSDL not loadable** → the recipe is created with `nutrition.status = "unavailable"` + `unavailableReason`, a warning is logged, no exception escapes. Timeouts (`NUTRITION_TIMEOUT_MS`, default 5000 ms) apply to the WSDL load and each call. The SOAP client is cached as a **promise** and the cache is cleared when the load fails, so a Spring Boot started *after* Node is picked up by the next request without restarting Node.
- **Recipes without nutrition**: `Recipe.nutrition` defaults to `null` (not zeros); old recipes load unchanged and the UI shows nothing for them. `POST …/nutrition/refresh` never overwrites stored nutrition with an "unavailable" marker (it answers HTTP 503 instead), whereas creating or updating (PUT) a recipe during an outage stores `unavailable` because the ingredients changed and the old values would be wrong.
- **Ingredient ↔ legacy code**: `Ingredient.nutritionCode` (optional). It is filled by `server/utils/nutritionCodes.js`: explicit mapping for Saveur names that differ from legacy codes (`Tomatoes → TOMATO`, `Flour → FLOUR_WHEAT`, `Eggs → EGG_WHOLE`…), otherwise a derived uppercase code (`Olive oil → OLIVE_OIL`). Existing ingredients get a code lazily when they are next used; a hand-curated code is never overwritten.
- **All codes in ONE call**, de-duplicated before sending; the server also de-duplicates and answers in request order.

#### Unit conversion to grams (`nutritionCalculator.js`)

| Unit(s) | Rule |
| --- | --- |
| `mg`, `g`, `kg`, `oz`, `lb` | exact (oz = 28.3495 g, lb = 453.592 g) |
| `ml`, `cl`, `dl`, `l`, `tsp` (5 ml), `tbsp` (15 ml), `cup` (240 ml) | converted to ml, then **1 ml = 1 g** (water density — an approximation for oil, honey, milk…) |
| `piece`, `pcs`, `unit`, `slice`, `whole`, `clove`, `bunch`… | grams per piece, first match wins: `Ingredient.gramsPerUnit` (curated on the document) → **USDA table by legacy code** (`server/utils/gramsPerPiece.js`, values below) → **100 g, flagged as an estimate** in `warnings`. **`pcs` of garlic means ONE CLOVE (3 g), not a head.** |
| `pinch` (0.4 g), `dash` (0.6 g) | small fixed weights, flagged as estimates |
| anything else | ingredient **skipped and reported** in `skippedIngredients` (not fatal) |

Other rules: optional ingredients **are included** in the totals; only the final totals are rounded (1 decimal); `perServing = total / servings`; the status is `complete` (everything counted), `partial` (something skipped) or `unavailable` (nothing could be computed).

**Approximate flag.** `nutrition.approximate` (a Boolean, independent from `status`) is `true` when at least one counted ingredient was **not** given as an exact mass (`mg`/`g`/`kg`/`oz`/`lb`) or ml/l volume (`ml`/`cl`/`dl`/`l`): that is, when it came from a counted unit (`pcs`…), `tsp`/`tbsp`/`cup`, `pinch`/`dash`, or the 100 g default. A recipe can be `complete` **and** approximate. The nutrition card then prefixes the per-serving and total values with "≈" and adds a note. Recipes stored before this field existed read as `approximate: false` until they are refreshed.

#### Legacy seed: USDA sources

Source: USDA FoodData Central, **SR Legacy (April 2018)**, downloaded as `FoodData_Central_sr_legacy_food_json_2018-04.zip` from `fdc.nal.usda.gov/fdc-datasets/` (the API `DEMO_KEY` was rate-limited). The `data.sql` rows and the tables below were generated by one extraction run over that file (kcal = nutrient 208, protein 203, carbohydrate 205, fat 204). The piece weight comes from the same USDA food as the per-100 g values when the row is FDC-sourced; the portion label is quoted exactly. Where USDA has no "medium" portion (mango, plantain, lemon, cucumber, avocado, bread), the label actually used is the one shown.

Rows added to the legacy database (`MERGE`, so existing rows are untouched):

| Code | USDA food (SR Legacy) | FDC ID | kcal / protein / carbs / fat per 100 g | Grams per piece |
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

None of these 12 foods is one of the 14 EU allergens, so they have **no row in `allergen_map`** (intentional, not forgotten).

Already present (not re-added): `POTATO`, `BUTTER`, `OLIVE_OIL`, `SUGAR`, `MILK_WHOLE` ("Milk" maps to it), `CHICKEN_BREAST` ("Chicken").

Piece weights for pre-existing legacy rows (taken from the matching USDA food):

| Code | FDC ID | USDA portion | Grams |
|---|---|---|---|
| `EGG_WHOLE` | 171287 | `medium` | 44 |
| `TOMATO` | 170457 | `medium whole (2-3/5" dia)` | 123 |
| `POTATO` | 170026 | `Potato medium (2-1/4" to 3-1/4" dia)` | 213 |
| `LEMON` | 167746 | `fruit (2-1/8" dia)` | 58 |
| `BANANA` | 173944 | `medium (7" to 7-7/8" long)` | 118 |
| `AVOCADO` | 171705 | `avocado, NS as to Florida or California` | 201 |
| `CUCUMBER` | 168409 | `cucumber (8-1/4")` | 301 |
| `BREAD_WHEAT` | 172688 | `slice` | 32 |

Notes: garlic is **3 g per clove** (USDA) rather than the ~5 g often quoted; the egg weight is the USDA **medium** egg (44 g), not a large one (50 g); `Plantain` uses USDA's single `plantain` portion (270 g) and `Mango` its `fruit without refuse` portion (336 g).

#### How new rows reach an existing H2 file

`application.properties` sets `spring.sql.init.mode=always`, so Spring runs `schema.sql` and `data.sql` on **every** start, including on an existing `data/nutrition-db.mv.db`. `schema.sql` only has `CREATE TABLE IF NOT EXISTS`; `data.sql` uses `MERGE INTO … KEY (ingredient_code)` (and `KEY (ingredient_id, allergen_name)` for allergens): a code that is absent is **inserted**, a code that exists is **updated in place** (its `id` is kept, so no duplicate-key error and no foreign-key breakage). The `publisher` column was added later, so `schema.sql` also runs `ALTER TABLE ingredient_nutrition ADD COLUMN IF NOT EXISTS publisher …` (a no-op on a new or already migrated file): an existing H2 file gets the column on the next start, its rows receive the default value, and `data.sql` then sets the right publisher on every row. `mvn clean` never touches `legacy-nutritional-db/data/`. Limit: `MERGE` never **deletes**, so removing a row from `data.sql` does not remove it from an existing file (delete the file, or run an explicit `DELETE`, to reset).


### Tests

- `legacy-nutritional-db`: `mvn clean package` (endpoint tests with `MockWebServiceClient`: valid request, duplicates, fault listing all unknown codes, XSD violations, new USDA codes, `XYZ`/`SAFFRON` still unknown, `publisher` present on every ingredient).
- Saveur: `npm test` (vitest — unit conversion, USDA piece weights, `approximate` flag, totals, XML→JSON normalisation, fault/unavailable handling, client re-creation, `NutritionCard` rendering with and without "≈") and `npm run lint`.
