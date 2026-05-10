# Firebase Security Specification - Saveur

## Data Invariants
1. **Recipes:** Must have a valid title, categoryId, and difficulty. If public, can be read by anyone. If private, only by the owner.
2. **Steps/Ingredients:** Belong to a Recipe. Access is inherited from the parent Recipe's visibility.
3. **Meal Plans:** Only the owner can read or write their meal plans.
4. **User Favorites:** Only the owner can manage their favorites.
5. **Categories/Global Ingredients:** Read-only for everyone (read by anyone), writeable only by admins.

## The "Dirty Dozen" Payloads (Identity, Integrity, State)
1. **Spoofing Owner:** Create a recipe with `userId` set to another user.
2. **Modifying Hidden Fields:** Attempt to update `createdAt` on a recipe.
3. **Admin Escalation:** Attempt to write to the `categories` collection as a standard user.
4. **Invalid Difficulty:** Create a recipe with difficulty 10 (max 5).
5. **Orphaned Step:** Create a step for a recipe that doesn't exist.
6. **Cross-User Meal Plan:** Update a meal plan belonging to someone else.
7. **Jumbo Document ID:** Write a meal plan with a 2KB string as ID.
8. **Malicious Ingredient Data:** Update a recipe ingredient with a negative quantity.
9. **Private Breach:** Read a private recipe belonging to another user.
10. **State Shortcut:** (N/A for this app, but if we had a review process, skipping review).
11. **Shadow Field Injection:** Add an `isVerified` field to a recipe as a client.
12. **Denial of Wallet:** Rapidly create 500 favorites in a single batch (rule should limit frequency or size, though standard Firestore handles some of this).

## The Test Runner
A `firestore.rules.test.ts` will verify these rejections.
