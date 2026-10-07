# Saveur - Recipe Meal Planner

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
| `allergen_map.allergen_name` VARCHAR(50) + `CHECK IN (...)` (FK `ingredient_id` → `ingredient_nutrition.id`) | `AllergenNameType` = enumeration (14 EU allergens), listed in `AllergenListType` (`allergen` 0..unbounded) | `enum AllergenNameType` | `allergens: string[]` (always an array) | `nutrition.allergens: [String]` (unique, sorted) |
| request list | `GetNutritionalValuesRequestType`: `ingredientCode` **minOccurs 1, maxOccurs unbounded** | `List<String>` | `{ ingredientCode: string[] }` | — |

XSD restrictions repeat the SQL constraints (`CHECK` ranges, `DECIMAL(p,s)`, `VARCHAR(n)`), and the service **validates both
requests and responses against the XSD** (`PayloadValidatingInterceptor`). The fault has its own typed element
(`getNutritionalValuesFault`) so the WSDL contains a real `wsdl:fault`.

### Design decisions and assumptions

- **`publisher VARCHAR` column omitted**: the brief lists it on `ingredient_nutrition`, but it is a copy-paste error from another group's scenario (a nutritional table has no publisher). `carbs_g` and `fats_g` were **added** because they are required in the output.
- **Extra `databaseId` (xsd:long)** in each result so that the BIGINT key appears in the contract; `ingredientId` carries the business key `ingredient_code` as requested.
- **Allergen list is an enumeration** (EU 14 allergens, `LACTOSE` = milk family, `NUTS` = tree nuts, as in the brief) with a matching SQL `CHECK`, so XSD and SQL stay equivalent.
- **Named types everywhere** (contract quality). Because named types have no `@XmlRootElement`, the endpoint exchanges `JAXBElement<…>` built with the generated `ObjectFactory`.
- **Seed**: 28 ingredients (more than the "~15" asked) so that most Saveur seed recipes get full nutrition; 0, 1 and 2 allergens are all represented (e.g. `TOMATO` none, `FLOUR_WHEAT` one, `CHOCOLATE_MILK` two). Values are order-of-magnitude USDA/CIQUAL figures for demo purposes, not medical data.
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
| `piece`, `unit`, `slice`, `whole`, `clove`, `bunch`… | `Ingredient.gramsPerUnit` (seeded: egg 50 g, lemon 60 g, avocado 150 g, banana 120 g, mango 200 g, plantain 180 g, bread slice 30 g); if unknown, **100 g, flagged as an estimate** in `warnings` |
| `pinch` (0.4 g), `dash` (0.6 g) | small fixed weights, flagged as estimates |
| anything else | ingredient **skipped and reported** in `skippedIngredients` (not fatal) |

Other rules: optional ingredients **are included** in the totals; only the final totals are rounded (1 decimal); `perServing = total / servings`; the status is `complete` (everything counted), `partial` (something skipped) or `unavailable` (nothing could be computed).

### Tests

- `legacy-nutritional-db`: `mvn clean package` (endpoint tests with `MockWebServiceClient`: valid request, duplicates, fault listing all unknown codes, XSD violations).
- Saveur: `npm test` (vitest — unit conversion, totals, XML→JSON normalisation, fault/unavailable handling, client re-creation, `NutritionCard` rendering) and `npm run lint`.

## Project Notes

The original mobile/Firebase prototype files were removed because the exam brief requires a web application using JavaScript, Node.js/Express and MongoDB.
