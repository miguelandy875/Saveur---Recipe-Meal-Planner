import React, { createContext, useContext, useMemo, useState } from 'react';
import { LanguageCode } from '../types';

type TranslationKey =
  | 'app.tagline'
  | 'nav.home'
  | 'nav.catalog'
  | 'nav.planner'
  | 'nav.groceries'
  | 'nav.profile'
  | 'nav.account'
  | 'nav.signIn'
  | 'nav.required'
  | 'common.loading'
  | 'common.clear'
  | 'common.add'
  | 'common.update'
  | 'common.print'
  | 'common.generate'
  | 'common.apply'
  | 'common.reset'
  | 'common.cancel'
  | 'common.save'
  | 'common.back'
  | 'common.exit'
  | 'common.next'
  | 'common.previous'
  | 'common.optional'
  | 'common.public'
  | 'common.by'
  | 'common.pageOf'
  | 'common.minutesShort'
  | 'common.level'
  | 'common.servings'
  | 'common.cuisine'
  | 'common.offline'
  | 'difficulty.easy'
  | 'difficulty.intermediate'
  | 'difficulty.difficult'
  | 'home.eyebrow'
  | 'home.titleGuest'
  | 'home.titleUser'
  | 'home.subtitle'
  | 'home.newRecipe'
  | 'home.recipeOfDay'
  | 'home.exploreCatalog'
  | 'home.categories'
  | 'home.viewCatalog'
  | 'home.recommended'
  | 'home.signInPrompt'
  | 'stats.recipes'
  | 'stats.myRecipes'
  | 'stats.favorites'
  | 'stats.plannedMeals'
  | 'stats.groceryItems'
  | 'catalog.title'
  | 'catalog.subtitle'
  | 'catalog.searchPlaceholder'
  | 'catalog.topCollections'
  | 'catalog.showLess'
  | 'catalog.viewAll'
  | 'catalog.viewingCollection'
  | 'catalog.exploreCollection'
  | 'catalog.noCollectionRecipes'
  | 'catalog.difficulty'
  | 'catalog.beginner'
  | 'catalog.intermediate'
  | 'catalog.expert'
  | 'catalog.maxTime'
  | 'catalog.underMinutes'
  | 'catalog.searchResults'
  | 'catalog.allRecipes'
  | 'catalog.noRecipes'
  | 'catalog.clearFilters'
  | 'catalog.filters'
  | 'catalog.byCollection'
  | 'catalog.byDifficulty'
  | 'catalog.maxTimeShort'
  | 'create.signInTitle'
  | 'create.signInText'
  | 'create.goToAccount'
  | 'create.title'
  | 'create.editTitle'
  | 'create.subtitle'
  | 'create.editSubtitle'
  | 'create.editForbidden'
  | 'create.imageHelp'
  | 'create.uploadPhoto'
  | 'create.takePhoto'
  | 'create.pasteUrl'
  | 'create.clearImage'
  | 'create.recipeTitle'
  | 'create.imageUrl'
  | 'create.description'
  | 'create.ingredients'
  | 'create.ingredientName'
  | 'create.quantity'
  | 'create.unit'
  | 'create.addIngredient'
  | 'create.steps'
  | 'create.step'
  | 'create.stepTitle'
  | 'create.stepDescription'
  | 'create.addStep'
  | 'create.prep'
  | 'create.cook'
  | 'create.level'
  | 'create.servings'
  | 'create.category'
  | 'create.selectCategory'
  | 'create.visiblePublic'
  | 'create.saving'
  | 'create.saveRecipe'
  | 'create.updateRecipe'
  | 'create.uploading'
  | 'recipe.notFound'
  | 'recipe.notFoundText'
  | 'recipe.ingredients'
  | 'recipe.steps'
  | 'recipe.whatYouNeed'
  | 'recipe.startCooking'
  | 'recipe.cookingMode'
  | 'recipe.stepCount'
  | 'recipe.noSteps'
  | 'recipe.finishCooking'
  | 'recipe.edit'
  | 'recipe.delete'
  | 'recipe.deleteConfirm'
  | 'recipe.deleteError'
  | 'nutrition.title'
  | 'nutrition.perServing'
  | 'nutrition.total'
  | 'nutrition.calories'
  | 'nutrition.proteins'
  | 'nutrition.carbs'
  | 'nutrition.fats'
  | 'nutrition.allergens'
  | 'nutrition.noAllergens'
  | 'nutrition.partial'
  | 'nutrition.unavailable'
  | 'nutrition.source'
  | 'planner.signInTitle'
  | 'planner.signInText'
  | 'planner.title'
  | 'planner.weekOf'
  | 'planner.emptySlot'
  | 'planner.pickRecipe'
  | 'planner.nutrition'
  | 'planner.nutritionTextComplete'
  | 'planner.nutritionTextIncomplete'
  | 'planner.estimatedCalories'
  | 'planner.pick'
  | 'planner.searchPlaceholder'
  | 'planner.noRecipes'
  | 'groceries.signInTitle'
  | 'groceries.signInText'
  | 'groceries.title'
  | 'groceries.remaining'
  | 'groceries.smart'
  | 'groceries.synced'
  | 'groceries.noGroceries'
  | 'groceries.noGroceriesText'
  | 'groceries.openPlanner'
  | 'groceries.addCustom'
  | 'groceries.addCustomAction'
  | 'groceries.customDialogTitle'
  | 'groceries.itemName'
  | 'groceries.quantity'
  | 'groceries.unit'
  | 'groceries.category'
  | 'groceries.suggestedCategory'
  | 'groceries.saveCustom'
  | 'groceries.removeItem'
  | 'shoppingCategory.DAIRY'
  | 'shoppingCategory.PRODUCE'
  | 'shoppingCategory.PASTA_GRAINS'
  | 'shoppingCategory.PANTRY'
  | 'shoppingCategory.MEAT_PROTEIN'
  | 'shoppingCategory.BAKERY'
  | 'shoppingCategory.FROZEN'
  | 'shoppingCategory.BEVERAGES'
  | 'shoppingCategory.OTHER'
  | 'profile.authEyebrow'
  | 'profile.authTitle'
  | 'profile.authText'
  | 'profile.demoLogin'
  | 'profile.login'
  | 'profile.register'
  | 'profile.fullName'
  | 'profile.email'
  | 'profile.password'
  | 'profile.createAccount'
  | 'profile.logout'
  | 'profile.myCookbook'
  | 'profile.emptyCookbook'
  | 'profile.createFirstRecipe'
  | 'profile.favoriteEmpty'
  | 'profile.nextOnMenu'
  | 'profile.viewAll'
  | 'profile.showLess'
  | 'profile.logoutSession'
  | 'profile.weeklySchedule'
  | 'profile.weeklyScheduleText'
  | 'profile.openPlanner'
  | 'profile.accountDetails'
  | 'profile.savedCollections'
  | 'profile.preferences'
  | 'profile.systemInformation'
  | 'profile.language'
  | 'profile.signInWithAccount'
  | 'profile.browseCatalog'
  | 'profile.generateGroceries'
  | 'meal.breakfast'
  | 'meal.lunch'
  | 'meal.dinner'
  | 'meal.snack'
  | 'category.breakfast'
  | 'category.main-dishes'
  | 'category.desserts'
  | 'category.salads'
  | 'category.appetizers'
  | 'category.snacks';

type Dictionary = Record<TranslationKey, string>;

const dictionaries: Record<LanguageCode, Dictionary> = {
  en: {
    'app.tagline': 'Recipe Planner',
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.planner': 'Planner',
    'nav.groceries': 'Groceries',
    'nav.profile': 'Profile',
    'nav.account': 'Account',
    'nav.signIn': 'Sign in',
    'nav.required': 'Required',
    'common.loading': 'Loading',
    'common.clear': 'Clear',
    'common.add': 'Add',
    'common.update': 'Update',
    'common.print': 'Print',
    'common.generate': 'Generate',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.exit': 'Exit',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.optional': 'Optional',
    'common.public': 'Public',
    'common.by': 'By',
    'common.pageOf': 'Page {page} of {total}',
    'common.minutesShort': '{count} min',
    'common.level': 'Level {level}',
    'common.servings': '{count} servings',
    'common.cuisine': 'Cuisine',
    'common.offline': 'You are offline. Saved app screens may still open, but live data needs the server.',
    'difficulty.easy': 'Easy',
    'difficulty.intermediate': 'Intermediate',
    'difficulty.difficult': 'Difficult',
    'home.eyebrow': 'Home',
    'home.titleGuest': 'Explore recipes made for real weekly planning',
    'home.titleUser': 'Welcome, {name}',
    'home.subtitle': 'Browse public recipes, plan meals, and turn your weekly menu into a smart grocery list.',
    'home.newRecipe': 'New recipe',
    'home.recipeOfDay': 'Recipe of the day',
    'home.exploreCatalog': 'Explore the recipe catalog',
    'home.categories': 'Categories',
    'home.viewCatalog': 'View catalog',
    'home.recommended': 'Recommended recipes',
    'home.signInPrompt': 'Sign in to save favorites, build plans, and create your own cookbook.',
    'stats.recipes': 'Recipes',
    'stats.myRecipes': 'My recipes',
    'stats.favorites': 'Favorites',
    'stats.plannedMeals': 'Planned meals',
    'stats.groceryItems': 'Grocery items',
    'catalog.title': 'Recipe Catalog',
    'catalog.subtitle': 'Filter recipes by category, time and difficulty.',
    'catalog.searchPlaceholder': 'Search recipes, ingredients...',
    'catalog.topCollections': 'Top Collections',
    'catalog.showLess': 'Show less',
    'catalog.viewAll': 'View all ({count})',
    'catalog.viewingCollection': 'Viewing collection',
    'catalog.exploreCollection': 'Explore collection',
    'catalog.noCollectionRecipes': 'No recipes in this collection yet.',
    'catalog.difficulty': 'Difficulty Level',
    'catalog.beginner': 'Beginner',
    'catalog.intermediate': 'Intermediate',
    'catalog.expert': 'Expert',
    'catalog.maxTime': 'Max Cooking Time',
    'catalog.underMinutes': 'Under {count} min',
    'catalog.searchResults': 'Search Results',
    'catalog.allRecipes': 'All Recipes',
    'catalog.noRecipes': 'No recipes found matching these filters.',
    'catalog.clearFilters': 'Clear all filters',
    'catalog.filters': 'Filters',
    'catalog.byCollection': 'By Collection',
    'catalog.byDifficulty': 'By Difficulty',
    'catalog.maxTimeShort': 'Max Time',
    'create.signInTitle': 'Sign in to create recipes',
    'create.signInText': 'Authenticated users can create recipes, favorites and meal plans.',
    'create.goToAccount': 'Go to account',
    'create.title': 'Create Recipe',
    'create.editTitle': 'Edit Recipe',
    'create.subtitle': 'Save ingredients, quantities, units and preparation steps.',
    'create.editSubtitle': 'Update ingredients, quantities, units and preparation steps.',
    'create.editForbidden': 'You can edit only your own recipes.',
    'create.imageHelp': 'Upload, take a photo, or paste an image URL.',
    'create.uploadPhoto': 'Upload photo',
    'create.takePhoto': 'Take photo',
    'create.pasteUrl': 'Paste URL',
    'create.clearImage': 'Clear image',
    'create.recipeTitle': 'Recipe title',
    'create.imageUrl': 'Image URL',
    'create.description': 'Brief description',
    'create.ingredients': 'Ingredients',
    'create.ingredientName': 'Ingredient name',
    'create.quantity': 'Qty',
    'create.unit': 'Unit',
    'create.addIngredient': 'Add ingredient',
    'create.steps': 'Preparation Steps',
    'create.step': 'Step {count}',
    'create.stepTitle': 'Short step title',
    'create.stepDescription': 'Describe this step',
    'create.addStep': 'Add step',
    'create.prep': 'Prep',
    'create.cook': 'Cook',
    'create.level': 'Level',
    'create.servings': 'Servings',
    'create.category': 'Category',
    'create.selectCategory': 'Select category',
    'create.visiblePublic': 'Visible in the public catalog',
    'create.saving': 'Saving recipe...',
    'create.saveRecipe': 'Save Recipe',
    'create.updateRecipe': 'Update Recipe',
    'create.uploading': 'Uploading photo...',
    'recipe.notFound': 'Recipe not found',
    'recipe.notFoundText': 'It may have been deleted or made private.',
    'recipe.ingredients': 'Ingredients',
    'recipe.steps': 'Steps',
    'recipe.whatYouNeed': "What you'll need",
    'recipe.startCooking': 'Start Cooking Mode',
    'recipe.cookingMode': 'Cooking Mode',
    'recipe.stepCount': 'Step {current} of {total}',
    'recipe.noSteps': 'No preparation steps have been added yet.',
    'recipe.finishCooking': 'Finish cooking',
    'recipe.edit': 'Edit recipe',
    'recipe.delete': 'Delete recipe',
    'recipe.deleteConfirm': 'Delete this recipe? This action cannot be undone.',
    'recipe.deleteError': 'The recipe could not be deleted. Please try again.',
    'nutrition.title': 'Nutrition',
    'nutrition.perServing': 'Per serving',
    'nutrition.total': 'Whole recipe',
    'nutrition.calories': 'Calories',
    'nutrition.proteins': 'Proteins',
    'nutrition.carbs': 'Carbs',
    'nutrition.fats': 'Fats',
    'nutrition.allergens': 'Allergens',
    'nutrition.noAllergens': 'No known allergen',
    'nutrition.partial': 'Partial values: {count} ingredient(s) could not be counted.',
    'nutrition.unavailable': 'Nutritional values are temporarily unavailable.',
    'nutrition.source': 'Source: legacy nutritional database',
    'planner.signInTitle': 'Sign in to plan meals',
    'planner.signInText': 'Meal plans belong to each authenticated user.',
    'planner.title': 'Meal Planner',
    'planner.weekOf': 'Week of {start} - {end}',
    'planner.emptySlot': 'Empty Slot',
    'planner.pickRecipe': 'Pick a recipe',
    'planner.nutrition': 'Nutritional Insight',
    'planner.nutritionTextComplete': "Your current plan for {day} is well-balanced. You're meeting your primary nutritional goals.",
    'planner.nutritionTextIncomplete': 'Your current plan for {day} is incomplete. Try adding more meals to see insights.',
    'planner.estimatedCalories': 'Estimated Calories',
    'planner.pick': 'Pick {meal}',
    'planner.searchPlaceholder': 'Search recipes...',
    'planner.noRecipes': 'No recipes found. Try a different search or create a new recipe.',
    'groceries.signInTitle': 'Sign in for groceries',
    'groceries.signInText': 'The smart shopping list is generated from your own weekly meal plan.',
    'groceries.title': 'Grocery List',
    'groceries.remaining': '{count} items remaining',
    'groceries.smart': 'Smart Shopping',
    'groceries.synced': 'Synced with meal plan',
    'groceries.noGroceries': 'No groceries yet',
    'groceries.noGroceriesText': 'Add recipes to your weekly planner, then generate the shopping list.',
    'groceries.openPlanner': 'Open planner',
    'groceries.addCustom': 'Add custom item',
    'groceries.addCustomAction': 'Add custom item',
    'groceries.customDialogTitle': 'Add a custom item',
    'groceries.itemName': 'Item name',
    'groceries.quantity': 'Quantity',
    'groceries.unit': 'Unit',
    'groceries.category': 'Shopping category',
    'groceries.suggestedCategory': 'Suggested category: {category}',
    'groceries.saveCustom': 'Save item',
    'groceries.removeItem': 'Remove item',
    'shoppingCategory.DAIRY': 'Dairy',
    'shoppingCategory.PRODUCE': 'Produce',
    'shoppingCategory.PASTA_GRAINS': 'Pasta and grains',
    'shoppingCategory.PANTRY': 'Pantry',
    'shoppingCategory.MEAT_PROTEIN': 'Meat and protein',
    'shoppingCategory.BAKERY': 'Bakery',
    'shoppingCategory.FROZEN': 'Frozen',
    'shoppingCategory.BEVERAGES': 'Beverages',
    'shoppingCategory.OTHER': 'Other',
    'profile.authEyebrow': 'Authentication',
    'profile.authTitle': 'Saveur Account',
    'profile.authText': 'Sign in to sync recipes, favorites, weekly meal plans and groceries.',
    'profile.demoLogin': 'Demo login',
    'profile.login': 'Login',
    'profile.register': 'Register',
    'profile.fullName': 'Full name',
    'profile.email': 'Email',
    'profile.password': 'Password',
    'profile.createAccount': 'Create account',
    'profile.logout': 'Logout',
    'profile.myCookbook': 'My Cookbook',
    'profile.emptyCookbook': 'Your cookbook is empty',
    'profile.createFirstRecipe': 'Create your first recipe',
    'profile.favoriteEmpty': 'Favorite recipes will appear here.',
    'profile.nextOnMenu': 'Next on your menu',
    'profile.viewAll': 'View all',
    'profile.showLess': 'Show less',
    'profile.logoutSession': 'Logout session',
    'profile.weeklySchedule': 'Weekly Schedule',
    'profile.weeklyScheduleText': 'Check your planned meals for the week.',
    'profile.openPlanner': 'Open planner',
    'profile.accountDetails': 'Account Details',
    'profile.savedCollections': 'Saved Collections',
    'profile.preferences': 'Preferences',
    'profile.systemInformation': 'System Information',
    'profile.language': 'Language',
    'profile.signInWithAccount': 'Sign in with account',
    'profile.browseCatalog': 'Browse catalog',
    'profile.generateGroceries': 'Generate grocery list',
    'meal.breakfast': 'Breakfast',
    'meal.lunch': 'Lunch',
    'meal.dinner': 'Dinner',
    'meal.snack': 'Snack',
    'category.breakfast': 'Breakfast',
    'category.main-dishes': 'Main Dishes',
    'category.desserts': 'Desserts',
    'category.salads': 'Salads',
    'category.appetizers': 'Appetizers',
    'category.snacks': 'Snacks',
  },
  fr: {
    'app.tagline': 'Planificateur de recettes',
    'nav.home': 'Accueil',
    'nav.catalog': 'Catalogue',
    'nav.planner': 'Planning',
    'nav.groceries': 'Courses',
    'nav.profile': 'Profil',
    'nav.account': 'Compte',
    'nav.signIn': 'Connexion',
    'nav.required': 'Requis',
    'common.loading': 'Chargement',
    'common.clear': 'Effacer',
    'common.add': 'Ajouter',
    'common.update': 'Mettre à jour',
    'common.print': 'Imprimer',
    'common.generate': 'Générer',
    'common.apply': 'Appliquer',
    'common.reset': 'Réinitialiser',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.back': 'Retour',
    'common.exit': 'Quitter',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.optional': 'Optionnel',
    'common.public': 'Public',
    'common.by': 'Par',
    'common.pageOf': 'Page {page} sur {total}',
    'common.minutesShort': '{count} min',
    'common.level': 'Niveau {level}',
    'common.servings': '{count} portions',
    'common.cuisine': 'Cuisine',
    'common.offline': 'Vous êtes hors ligne. Les écrans enregistrés peuvent s’ouvrir, mais les données en direct nécessitent le serveur.',
    'difficulty.easy': 'Facile',
    'difficulty.intermediate': 'Intermédiaire',
    'difficulty.difficult': 'Difficile',
    'home.eyebrow': 'Accueil',
    'home.titleGuest': 'Explorez des recettes pensées pour organiser la semaine',
    'home.titleUser': 'Bienvenue, {name}',
    'home.subtitle': 'Parcourez les recettes publiques, planifiez les repas et transformez votre menu en liste de courses.',
    'home.newRecipe': 'Nouvelle recette',
    'home.recipeOfDay': 'Recette du jour',
    'home.exploreCatalog': 'Explorer le catalogue',
    'home.categories': 'Catégories',
    'home.viewCatalog': 'Voir le catalogue',
    'home.recommended': 'Recettes recommandées',
    'home.signInPrompt': 'Connectez-vous pour enregistrer vos favoris, planifier et créer votre carnet.',
    'stats.recipes': 'Recettes',
    'stats.myRecipes': 'Mes recettes',
    'stats.favorites': 'Favoris',
    'stats.plannedMeals': 'Repas planifiés',
    'stats.groceryItems': 'Articles de courses',
    'catalog.title': 'Catalogue de recettes',
    'catalog.subtitle': 'Filtrez les recettes par catégorie, temps et difficulté.',
    'catalog.searchPlaceholder': 'Rechercher recettes, ingrédients...',
    'catalog.topCollections': 'Collections principales',
    'catalog.showLess': 'Voir moins',
    'catalog.viewAll': 'Tout voir ({count})',
    'catalog.viewingCollection': 'Collection ouverte',
    'catalog.exploreCollection': 'Explorer la collection',
    'catalog.noCollectionRecipes': 'Aucune recette dans cette collection.',
    'catalog.difficulty': 'Niveau de difficulté',
    'catalog.beginner': 'Débutant',
    'catalog.intermediate': 'Intermédiaire',
    'catalog.expert': 'Expert',
    'catalog.maxTime': 'Temps maximum',
    'catalog.underMinutes': 'Moins de {count} min',
    'catalog.searchResults': 'Résultats',
    'catalog.allRecipes': 'Toutes les recettes',
    'catalog.noRecipes': 'Aucune recette ne correspond aux filtres.',
    'catalog.clearFilters': 'Effacer les filtres',
    'catalog.filters': 'Filtres',
    'catalog.byCollection': 'Par collection',
    'catalog.byDifficulty': 'Par difficulté',
    'catalog.maxTimeShort': 'Temps max',
    'create.signInTitle': 'Connectez-vous pour créer des recettes',
    'create.signInText': 'Les utilisateurs connectés peuvent créer des recettes, favoris et plans.',
    'create.goToAccount': 'Aller au compte',
    'create.title': 'Créer une recette',
    'create.editTitle': 'Modifier la recette',
    'create.subtitle': 'Enregistrez ingrédients, quantités, unités et étapes.',
    'create.editSubtitle': 'Mettez à jour les ingrédients, quantités, unités et étapes.',
    'create.editForbidden': 'Vous ne pouvez modifier que vos propres recettes.',
    'create.imageHelp': 'Téléversez, prenez une photo ou collez une URL.',
    'create.uploadPhoto': 'Téléverser',
    'create.takePhoto': 'Prendre photo',
    'create.pasteUrl': 'Coller URL',
    'create.clearImage': 'Retirer image',
    'create.recipeTitle': 'Titre de la recette',
    'create.imageUrl': 'URL de l’image',
    'create.description': 'Description courte',
    'create.ingredients': 'Ingrédients',
    'create.ingredientName': 'Nom de l’ingrédient',
    'create.quantity': 'Qté',
    'create.unit': 'Unité',
    'create.addIngredient': 'Ajouter ingrédient',
    'create.steps': 'Étapes de préparation',
    'create.step': 'Étape {count}',
    'create.stepTitle': 'Titre court',
    'create.stepDescription': 'Décrire cette étape',
    'create.addStep': 'Ajouter étape',
    'create.prep': 'Prépa',
    'create.cook': 'Cuisson',
    'create.level': 'Niveau',
    'create.servings': 'Portions',
    'create.category': 'Catégorie',
    'create.selectCategory': 'Choisir catégorie',
    'create.visiblePublic': 'Visible dans le catalogue public',
    'create.saving': 'Enregistrement...',
    'create.saveRecipe': 'Enregistrer',
    'create.updateRecipe': 'Mettre à jour',
    'create.uploading': 'Téléversement...',
    'recipe.notFound': 'Recette introuvable',
    'recipe.notFoundText': 'Elle a peut-être été supprimée ou rendue privée.',
    'recipe.ingredients': 'Ingrédients',
    'recipe.steps': 'Étapes',
    'recipe.whatYouNeed': 'Ce qu’il faut',
    'recipe.startCooking': 'Démarrer le mode cuisine',
    'recipe.cookingMode': 'Mode cuisine',
    'recipe.stepCount': 'Étape {current} sur {total}',
    'recipe.noSteps': 'Aucune étape de préparation n’a encore été ajoutée.',
    'recipe.finishCooking': 'Terminer',
    'recipe.edit': 'Modifier la recette',
    'recipe.delete': 'Supprimer la recette',
    'recipe.deleteConfirm': 'Supprimer cette recette ? Cette action est définitive.',
    'recipe.deleteError': 'La recette n’a pas pu être supprimée. Veuillez réessayer.',
    'nutrition.title': 'Nutrition',
    'nutrition.perServing': 'Par portion',
    'nutrition.total': 'Recette entière',
    'nutrition.calories': 'Calories',
    'nutrition.proteins': 'Protéines',
    'nutrition.carbs': 'Glucides',
    'nutrition.fats': 'Lipides',
    'nutrition.allergens': 'Allergènes',
    'nutrition.noAllergens': 'Aucun allergène connu',
    'nutrition.partial': 'Valeurs partielles : {count} ingrédient(s) non comptabilisé(s).',
    'nutrition.unavailable': 'Les valeurs nutritionnelles sont temporairement indisponibles.',
    'nutrition.source': 'Source : base nutritionnelle legacy',
    'planner.signInTitle': 'Connectez-vous pour planifier',
    'planner.signInText': 'Les plans de repas appartiennent à chaque utilisateur.',
    'planner.title': 'Planificateur de repas',
    'planner.weekOf': 'Semaine du {start} au {end}',
    'planner.emptySlot': 'Créneau vide',
    'planner.pickRecipe': 'Choisir une recette',
    'planner.nutrition': 'Aperçu nutritionnel',
    'planner.nutritionTextComplete': 'Votre plan pour {day} est équilibré. Vous atteignez vos objectifs principaux.',
    'planner.nutritionTextIncomplete': 'Votre plan pour {day} est incomplet. Ajoutez des repas pour voir les conseils.',
    'planner.estimatedCalories': 'Calories estimées',
    'planner.pick': 'Choisir {meal}',
    'planner.searchPlaceholder': 'Rechercher...',
    'planner.noRecipes': 'Aucune recette trouvée. Essayez une autre recherche ou créez une recette.',
    'groceries.signInTitle': 'Connectez-vous pour les courses',
    'groceries.signInText': 'La liste intelligente vient de votre planning hebdomadaire.',
    'groceries.title': 'Liste de courses',
    'groceries.remaining': '{count} articles restants',
    'groceries.smart': 'Courses intelligentes',
    'groceries.synced': 'Synchronisé avec le planning',
    'groceries.noGroceries': 'Aucune course',
    'groceries.noGroceriesText': 'Ajoutez des recettes au planning puis générez la liste.',
    'groceries.openPlanner': 'Ouvrir planning',
    'groceries.addCustom': 'Ajouter un article',
    'groceries.addCustomAction': 'Ajouter un article personnalisé',
    'groceries.customDialogTitle': 'Ajouter un article personnalisé',
    'groceries.itemName': 'Nom de l’article',
    'groceries.quantity': 'Quantité',
    'groceries.unit': 'Unité',
    'groceries.category': 'Rayon du magasin',
    'groceries.suggestedCategory': 'Catégorie suggérée : {category}',
    'groceries.saveCustom': 'Enregistrer l’article',
    'groceries.removeItem': 'Supprimer article',
    'shoppingCategory.DAIRY': 'Produits laitiers',
    'shoppingCategory.PRODUCE': 'Fruits et légumes',
    'shoppingCategory.PASTA_GRAINS': 'Pâtes et céréales',
    'shoppingCategory.PANTRY': 'Épicerie',
    'shoppingCategory.MEAT_PROTEIN': 'Viande et protéines',
    'shoppingCategory.BAKERY': 'Boulangerie',
    'shoppingCategory.FROZEN': 'Surgelés',
    'shoppingCategory.BEVERAGES': 'Boissons',
    'shoppingCategory.OTHER': 'Autre',
    'profile.authEyebrow': 'Authentification',
    'profile.authTitle': 'Compte Saveur',
    'profile.authText': 'Connectez-vous pour synchroniser recettes, favoris, plans et courses.',
    'profile.demoLogin': 'Compte démo',
    'profile.login': 'Connexion',
    'profile.register': 'Inscription',
    'profile.fullName': 'Nom complet',
    'profile.email': 'Email',
    'profile.password': 'Mot de passe',
    'profile.createAccount': 'Créer compte',
    'profile.logout': 'Déconnexion',
    'profile.myCookbook': 'Mon carnet',
    'profile.emptyCookbook': 'Votre carnet est vide',
    'profile.createFirstRecipe': 'Créer votre première recette',
    'profile.favoriteEmpty': 'Les recettes favorites apparaîtront ici.',
    'profile.nextOnMenu': 'Prochain menu',
    'profile.viewAll': 'Tout voir',
    'profile.showLess': 'Voir moins',
    'profile.logoutSession': 'Fermer la session',
    'profile.weeklySchedule': 'Planning hebdomadaire',
    'profile.weeklyScheduleText': 'Consultez les repas prévus pour la semaine.',
    'profile.openPlanner': 'Ouvrir planning',
    'profile.accountDetails': 'Détails du compte',
    'profile.savedCollections': 'Collections enregistrées',
    'profile.preferences': 'Préférences',
    'profile.systemInformation': 'Informations système',
    'profile.language': 'Langue',
    'profile.signInWithAccount': 'Se connecter',
    'profile.browseCatalog': 'Parcourir catalogue',
    'profile.generateGroceries': 'Générer liste',
    'meal.breakfast': 'Petit déjeuner',
    'meal.lunch': 'Déjeuner',
    'meal.dinner': 'Dîner',
    'meal.snack': 'Snack',
    'category.breakfast': 'Petit déjeuner',
    'category.main-dishes': 'Plats principaux',
    'category.desserts': 'Desserts',
    'category.salads': 'Salades',
    'category.appetizers': 'Apéritifs',
    'category.snacks': 'Snacks',
  },
  es: {
    'app.tagline': 'Planificador de recetas',
    'nav.home': 'Inicio',
    'nav.catalog': 'Catálogo',
    'nav.planner': 'Plan',
    'nav.groceries': 'Compras',
    'nav.profile': 'Perfil',
    'nav.account': 'Cuenta',
    'nav.signIn': 'Entrar',
    'nav.required': 'Requerido',
    'common.loading': 'Cargando',
    'common.clear': 'Limpiar',
    'common.add': 'Añadir',
    'common.update': 'Actualizar',
    'common.print': 'Imprimir',
    'common.generate': 'Generar',
    'common.apply': 'Aplicar',
    'common.reset': 'Restablecer',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.back': 'Volver',
    'common.exit': 'Salir',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.optional': 'Opcional',
    'common.public': 'Público',
    'common.by': 'Por',
    'common.pageOf': 'Página {page} de {total}',
    'common.minutesShort': '{count} min',
    'common.level': 'Nivel {level}',
    'common.servings': '{count} porciones',
    'common.cuisine': 'Cocina',
    'common.offline': 'Estás sin conexión. La app puede abrirse, pero los datos en vivo necesitan servidor.',
    'difficulty.easy': 'Fácil',
    'difficulty.intermediate': 'Intermedio',
    'difficulty.difficult': 'Difícil',
    'home.eyebrow': 'Inicio',
    'home.titleGuest': 'Explora recetas para planificar tu semana',
    'home.titleUser': 'Bienvenido, {name}',
    'home.subtitle': 'Explora recetas públicas, planifica comidas y crea una lista de compras inteligente.',
    'home.newRecipe': 'Nueva receta',
    'home.recipeOfDay': 'Receta del día',
    'home.exploreCatalog': 'Explorar catálogo',
    'home.categories': 'Categorías',
    'home.viewCatalog': 'Ver catálogo',
    'home.recommended': 'Recetas recomendadas',
    'home.signInPrompt': 'Inicia sesión para guardar favoritos, planes y tu recetario.',
    'stats.recipes': 'Recetas',
    'stats.myRecipes': 'Mis recetas',
    'stats.favorites': 'Favoritos',
    'stats.plannedMeals': 'Comidas planificadas',
    'stats.groceryItems': 'Artículos de compra',
    'catalog.title': 'Catálogo de recetas',
    'catalog.subtitle': 'Filtra recetas por categoría, tiempo y dificultad.',
    'catalog.searchPlaceholder': 'Buscar recetas, ingredientes...',
    'catalog.topCollections': 'Colecciones principales',
    'catalog.showLess': 'Ver menos',
    'catalog.viewAll': 'Ver todo ({count})',
    'catalog.viewingCollection': 'Colección abierta',
    'catalog.exploreCollection': 'Explorar colección',
    'catalog.noCollectionRecipes': 'No hay recetas en esta colección.',
    'catalog.difficulty': 'Dificultad',
    'catalog.beginner': 'Principiante',
    'catalog.intermediate': 'Intermedio',
    'catalog.expert': 'Experto',
    'catalog.maxTime': 'Tiempo máximo',
    'catalog.underMinutes': 'Menos de {count} min',
    'catalog.searchResults': 'Resultados',
    'catalog.allRecipes': 'Todas las recetas',
    'catalog.noRecipes': 'No se encontraron recetas.',
    'catalog.clearFilters': 'Limpiar filtros',
    'catalog.filters': 'Filtros',
    'catalog.byCollection': 'Por colección',
    'catalog.byDifficulty': 'Por dificultad',
    'catalog.maxTimeShort': 'Tiempo máx.',
    'create.signInTitle': 'Inicia sesión para crear recetas',
    'create.signInText': 'Los usuarios conectados pueden crear recetas, favoritos y planes.',
    'create.goToAccount': 'Ir a cuenta',
    'create.title': 'Crear receta',
    'create.editTitle': 'Editar receta',
    'create.subtitle': 'Guarda ingredientes, cantidades, unidades y pasos.',
    'create.editSubtitle': 'Actualiza ingredientes, cantidades, unidades y pasos.',
    'create.editForbidden': 'Solo puedes editar tus propias recetas.',
    'create.imageHelp': 'Sube, toma una foto o pega una URL.',
    'create.uploadPhoto': 'Subir foto',
    'create.takePhoto': 'Tomar foto',
    'create.pasteUrl': 'Pegar URL',
    'create.clearImage': 'Quitar imagen',
    'create.recipeTitle': 'Título de receta',
    'create.imageUrl': 'URL de imagen',
    'create.description': 'Descripción breve',
    'create.ingredients': 'Ingredientes',
    'create.ingredientName': 'Nombre del ingrediente',
    'create.quantity': 'Cant.',
    'create.unit': 'Unidad',
    'create.addIngredient': 'Añadir ingrediente',
    'create.steps': 'Pasos de preparación',
    'create.step': 'Paso {count}',
    'create.stepTitle': 'Título corto',
    'create.stepDescription': 'Describe este paso',
    'create.addStep': 'Añadir paso',
    'create.prep': 'Prep.',
    'create.cook': 'Cocción',
    'create.level': 'Nivel',
    'create.servings': 'Porciones',
    'create.category': 'Categoría',
    'create.selectCategory': 'Selecciona categoría',
    'create.visiblePublic': 'Visible en el catálogo público',
    'create.saving': 'Guardando...',
    'create.saveRecipe': 'Guardar receta',
    'create.updateRecipe': 'Actualizar receta',
    'create.uploading': 'Subiendo foto...',
    'recipe.notFound': 'Receta no encontrada',
    'recipe.notFoundText': 'Puede haber sido eliminada o puesta privada.',
    'recipe.ingredients': 'Ingredientes',
    'recipe.steps': 'Pasos',
    'recipe.whatYouNeed': 'Lo que necesitas',
    'recipe.startCooking': 'Iniciar modo cocina',
    'recipe.cookingMode': 'Modo cocina',
    'recipe.stepCount': 'Paso {current} de {total}',
    'recipe.noSteps': 'Todavía no se añadieron pasos de preparación.',
    'recipe.finishCooking': 'Terminar',
    'recipe.edit': 'Editar receta',
    'recipe.delete': 'Eliminar receta',
    'recipe.deleteConfirm': '¿Eliminar esta receta? Esta acción no se puede deshacer.',
    'recipe.deleteError': 'No se pudo eliminar la receta. Inténtalo de nuevo.',
    'nutrition.title': 'Nutrición',
    'nutrition.perServing': 'Por porción',
    'nutrition.total': 'Receta completa',
    'nutrition.calories': 'Calorías',
    'nutrition.proteins': 'Proteínas',
    'nutrition.carbs': 'Carbohidratos',
    'nutrition.fats': 'Grasas',
    'nutrition.allergens': 'Alérgenos',
    'nutrition.noAllergens': 'Ningún alérgeno conocido',
    'nutrition.partial': 'Valores parciales: {count} ingrediente(s) no contabilizado(s).',
    'nutrition.unavailable': 'Los valores nutricionales no están disponibles temporalmente.',
    'nutrition.source': 'Fuente: base nutricional heredada',
    'planner.signInTitle': 'Inicia sesión para planificar',
    'planner.signInText': 'Los planes pertenecen a cada usuario.',
    'planner.title': 'Planificador de comidas',
    'planner.weekOf': 'Semana de {start} - {end}',
    'planner.emptySlot': 'Espacio vacío',
    'planner.pickRecipe': 'Elegir receta',
    'planner.nutrition': 'Vista nutricional',
    'planner.nutritionTextComplete': 'Tu plan para {day} está equilibrado. Cumples tus objetivos principales.',
    'planner.nutritionTextIncomplete': 'Tu plan para {day} está incompleto. Añade más comidas para ver consejos.',
    'planner.estimatedCalories': 'Calorías estimadas',
    'planner.pick': 'Elegir {meal}',
    'planner.searchPlaceholder': 'Buscar recetas...',
    'planner.noRecipes': 'No hay recetas. Prueba otra búsqueda o crea una.',
    'groceries.signInTitle': 'Inicia sesión para compras',
    'groceries.signInText': 'La lista inteligente se genera desde tu plan semanal.',
    'groceries.title': 'Lista de compras',
    'groceries.remaining': '{count} artículos restantes',
    'groceries.smart': 'Compra inteligente',
    'groceries.synced': 'Sincronizado con el plan',
    'groceries.noGroceries': 'Sin compras aún',
    'groceries.noGroceriesText': 'Añade recetas al plan y genera la lista.',
    'groceries.openPlanner': 'Abrir plan',
    'groceries.addCustom': 'Añadir artículo',
    'groceries.addCustomAction': 'Añadir artículo personalizado',
    'groceries.customDialogTitle': 'Añadir artículo personalizado',
    'groceries.itemName': 'Nombre del artículo',
    'groceries.quantity': 'Cantidad',
    'groceries.unit': 'Unidad',
    'groceries.category': 'Sección de tienda',
    'groceries.suggestedCategory': 'Categoría sugerida: {category}',
    'groceries.saveCustom': 'Guardar artículo',
    'groceries.removeItem': 'Eliminar artículo',
    'shoppingCategory.DAIRY': 'Lácteos',
    'shoppingCategory.PRODUCE': 'Frutas y verduras',
    'shoppingCategory.PASTA_GRAINS': 'Pasta y cereales',
    'shoppingCategory.PANTRY': 'Despensa',
    'shoppingCategory.MEAT_PROTEIN': 'Carne y proteína',
    'shoppingCategory.BAKERY': 'Panadería',
    'shoppingCategory.FROZEN': 'Congelados',
    'shoppingCategory.BEVERAGES': 'Bebidas',
    'shoppingCategory.OTHER': 'Otros',
    'profile.authEyebrow': 'Autenticación',
    'profile.authTitle': 'Cuenta Saveur',
    'profile.authText': 'Inicia sesión para sincronizar recetas, favoritos, planes y compras.',
    'profile.demoLogin': 'Cuenta demo',
    'profile.login': 'Entrar',
    'profile.register': 'Registrarse',
    'profile.fullName': 'Nombre completo',
    'profile.email': 'Email',
    'profile.password': 'Contraseña',
    'profile.createAccount': 'Crear cuenta',
    'profile.logout': 'Salir',
    'profile.myCookbook': 'Mi recetario',
    'profile.emptyCookbook': 'Tu recetario está vacío',
    'profile.createFirstRecipe': 'Crea tu primera receta',
    'profile.favoriteEmpty': 'Tus favoritas aparecerán aquí.',
    'profile.nextOnMenu': 'Próximo en tu menú',
    'profile.viewAll': 'Ver todo',
    'profile.showLess': 'Ver menos',
    'profile.logoutSession': 'Cerrar sesión',
    'profile.weeklySchedule': 'Agenda semanal',
    'profile.weeklyScheduleText': 'Revisa tus comidas planificadas.',
    'profile.openPlanner': 'Abrir plan',
    'profile.accountDetails': 'Detalles de cuenta',
    'profile.savedCollections': 'Colecciones guardadas',
    'profile.preferences': 'Preferencias',
    'profile.systemInformation': 'Información del sistema',
    'profile.language': 'Idioma',
    'profile.signInWithAccount': 'Iniciar sesión',
    'profile.browseCatalog': 'Ver catálogo',
    'profile.generateGroceries': 'Generar compras',
    'meal.breakfast': 'Desayuno',
    'meal.lunch': 'Almuerzo',
    'meal.dinner': 'Cena',
    'meal.snack': 'Snack',
    'category.breakfast': 'Desayuno',
    'category.main-dishes': 'Platos principales',
    'category.desserts': 'Postres',
    'category.salads': 'Ensaladas',
    'category.appetizers': 'Aperitivos',
    'category.snacks': 'Snacks',
  },
  it: {
    'app.tagline': 'Pianificatore di ricette',
    'nav.home': 'Home',
    'nav.catalog': 'Catalogo',
    'nav.planner': 'Piano',
    'nav.groceries': 'Spesa',
    'nav.profile': 'Profilo',
    'nav.account': 'Account',
    'nav.signIn': 'Accedi',
    'nav.required': 'Richiesto',
    'common.loading': 'Caricamento',
    'common.clear': 'Cancella',
    'common.add': 'Aggiungi',
    'common.update': 'Aggiorna',
    'common.print': 'Stampa',
    'common.generate': 'Genera',
    'common.apply': 'Applica',
    'common.reset': 'Ripristina',
    'common.cancel': 'Annulla',
    'common.save': 'Salva',
    'common.back': 'Indietro',
    'common.exit': 'Esci',
    'common.next': 'Avanti',
    'common.previous': 'Precedente',
    'common.optional': 'Opzionale',
    'common.public': 'Pubblica',
    'common.by': 'Di',
    'common.pageOf': 'Pagina {page} di {total}',
    'common.minutesShort': '{count} min',
    'common.level': 'Livello {level}',
    'common.servings': '{count} porzioni',
    'common.cuisine': 'Cucina',
    'common.offline': 'Sei offline. La shell app può aprirsi, ma i dati live richiedono il server.',
    'difficulty.easy': 'Facile',
    'difficulty.intermediate': 'Intermedio',
    'difficulty.difficult': 'Difficile',
    'home.eyebrow': 'Home',
    'home.titleGuest': 'Esplora ricette pensate per la settimana',
    'home.titleUser': 'Benvenuto, {name}',
    'home.subtitle': 'Sfoglia ricette pubbliche, pianifica pasti e crea una lista spesa intelligente.',
    'home.newRecipe': 'Nuova ricetta',
    'home.recipeOfDay': 'Ricetta del giorno',
    'home.exploreCatalog': 'Esplora il catalogo',
    'home.categories': 'Categorie',
    'home.viewCatalog': 'Vedi catalogo',
    'home.recommended': 'Ricette consigliate',
    'home.signInPrompt': 'Accedi per salvare preferiti, piani e il tuo ricettario.',
    'stats.recipes': 'Ricette',
    'stats.myRecipes': 'Le mie ricette',
    'stats.favorites': 'Preferiti',
    'stats.plannedMeals': 'Pasti pianificati',
    'stats.groceryItems': 'Articoli spesa',
    'catalog.title': 'Catalogo ricette',
    'catalog.subtitle': 'Filtra ricette per categoria, tempo e difficoltà.',
    'catalog.searchPlaceholder': 'Cerca ricette, ingredienti...',
    'catalog.topCollections': 'Collezioni principali',
    'catalog.showLess': 'Mostra meno',
    'catalog.viewAll': 'Vedi tutto ({count})',
    'catalog.viewingCollection': 'Collezione aperta',
    'catalog.exploreCollection': 'Esplora collezione',
    'catalog.noCollectionRecipes': 'Nessuna ricetta in questa collezione.',
    'catalog.difficulty': 'Difficoltà',
    'catalog.beginner': 'Principiante',
    'catalog.intermediate': 'Intermedio',
    'catalog.expert': 'Esperto',
    'catalog.maxTime': 'Tempo massimo',
    'catalog.underMinutes': 'Meno di {count} min',
    'catalog.searchResults': 'Risultati',
    'catalog.allRecipes': 'Tutte le ricette',
    'catalog.noRecipes': 'Nessuna ricetta trovata.',
    'catalog.clearFilters': 'Cancella filtri',
    'catalog.filters': 'Filtri',
    'catalog.byCollection': 'Per collezione',
    'catalog.byDifficulty': 'Per difficoltà',
    'catalog.maxTimeShort': 'Tempo max',
    'create.signInTitle': 'Accedi per creare ricette',
    'create.signInText': 'Gli utenti autenticati possono creare ricette, preferiti e piani.',
    'create.goToAccount': 'Vai all’account',
    'create.title': 'Crea ricetta',
    'create.editTitle': 'Modifica ricetta',
    'create.subtitle': 'Salva ingredienti, quantità, unità e passaggi.',
    'create.editSubtitle': 'Aggiorna ingredienti, quantità, unità e passaggi.',
    'create.editForbidden': 'Puoi modificare solo le tue ricette.',
    'create.imageHelp': 'Carica, scatta una foto o incolla un URL.',
    'create.uploadPhoto': 'Carica foto',
    'create.takePhoto': 'Scatta foto',
    'create.pasteUrl': 'Incolla URL',
    'create.clearImage': 'Rimuovi immagine',
    'create.recipeTitle': 'Titolo ricetta',
    'create.imageUrl': 'URL immagine',
    'create.description': 'Descrizione breve',
    'create.ingredients': 'Ingredienti',
    'create.ingredientName': 'Nome ingrediente',
    'create.quantity': 'Qtà',
    'create.unit': 'Unità',
    'create.addIngredient': 'Aggiungi ingrediente',
    'create.steps': 'Passaggi',
    'create.step': 'Passo {count}',
    'create.stepTitle': 'Titolo breve',
    'create.stepDescription': 'Descrivi questo passo',
    'create.addStep': 'Aggiungi passo',
    'create.prep': 'Prep.',
    'create.cook': 'Cottura',
    'create.level': 'Livello',
    'create.servings': 'Porzioni',
    'create.category': 'Categoria',
    'create.selectCategory': 'Scegli categoria',
    'create.visiblePublic': 'Visibile nel catalogo pubblico',
    'create.saving': 'Salvataggio...',
    'create.saveRecipe': 'Salva ricetta',
    'create.updateRecipe': 'Aggiorna ricetta',
    'create.uploading': 'Caricamento foto...',
    'recipe.notFound': 'Ricetta non trovata',
    'recipe.notFoundText': 'Potrebbe essere stata eliminata o resa privata.',
    'recipe.ingredients': 'Ingredienti',
    'recipe.steps': 'Passaggi',
    'recipe.whatYouNeed': 'Cosa serve',
    'recipe.startCooking': 'Avvia modalità cucina',
    'recipe.cookingMode': 'Modalità cucina',
    'recipe.stepCount': 'Passo {current} di {total}',
    'recipe.noSteps': 'Non sono ancora stati aggiunti passaggi.',
    'recipe.finishCooking': 'Termina',
    'recipe.edit': 'Modifica ricetta',
    'recipe.delete': 'Elimina ricetta',
    'recipe.deleteConfirm': 'Eliminare questa ricetta? Questa azione non può essere annullata.',
    'recipe.deleteError': 'Impossibile eliminare la ricetta. Riprova.',
    'nutrition.title': 'Nutrizione',
    'nutrition.perServing': 'Per porzione',
    'nutrition.total': 'Ricetta intera',
    'nutrition.calories': 'Calorie',
    'nutrition.proteins': 'Proteine',
    'nutrition.carbs': 'Carboidrati',
    'nutrition.fats': 'Grassi',
    'nutrition.allergens': 'Allergeni',
    'nutrition.noAllergens': 'Nessun allergene noto',
    'nutrition.partial': 'Valori parziali: {count} ingrediente/i non conteggiato/i.',
    'nutrition.unavailable': 'I valori nutrizionali sono temporaneamente non disponibili.',
    'nutrition.source': 'Fonte: database nutrizionale legacy',
    'planner.signInTitle': 'Accedi per pianificare',
    'planner.signInText': 'I piani pasto appartengono a ogni utente.',
    'planner.title': 'Piano pasti',
    'planner.weekOf': 'Settimana {start} - {end}',
    'planner.emptySlot': 'Slot vuoto',
    'planner.pickRecipe': 'Scegli ricetta',
    'planner.nutrition': 'Insight nutrizionale',
    'planner.nutritionTextComplete': 'Il piano per {day} è equilibrato. Stai raggiungendo gli obiettivi principali.',
    'planner.nutritionTextIncomplete': 'Il piano per {day} è incompleto. Aggiungi pasti per vedere consigli.',
    'planner.estimatedCalories': 'Calorie stimate',
    'planner.pick': 'Scegli {meal}',
    'planner.searchPlaceholder': 'Cerca ricette...',
    'planner.noRecipes': 'Nessuna ricetta. Prova un’altra ricerca o creane una.',
    'groceries.signInTitle': 'Accedi per la spesa',
    'groceries.signInText': 'La lista intelligente nasce dal tuo piano settimanale.',
    'groceries.title': 'Lista spesa',
    'groceries.remaining': '{count} articoli restanti',
    'groceries.smart': 'Spesa intelligente',
    'groceries.synced': 'Sincronizzato con il piano',
    'groceries.noGroceries': 'Nessuna spesa',
    'groceries.noGroceriesText': 'Aggiungi ricette al piano e genera la lista.',
    'groceries.openPlanner': 'Apri piano',
    'groceries.addCustom': 'Aggiungi articolo',
    'groceries.addCustomAction': 'Aggiungi articolo personalizzato',
    'groceries.customDialogTitle': 'Aggiungi articolo personalizzato',
    'groceries.itemName': 'Nome articolo',
    'groceries.quantity': 'Quantità',
    'groceries.unit': 'Unità',
    'groceries.category': 'Reparto',
    'groceries.suggestedCategory': 'Categoria suggerita: {category}',
    'groceries.saveCustom': 'Salva articolo',
    'groceries.removeItem': 'Rimuovi articolo',
    'shoppingCategory.DAIRY': 'Latticini',
    'shoppingCategory.PRODUCE': 'Frutta e verdura',
    'shoppingCategory.PASTA_GRAINS': 'Pasta e cereali',
    'shoppingCategory.PANTRY': 'Dispensa',
    'shoppingCategory.MEAT_PROTEIN': 'Carne e proteine',
    'shoppingCategory.BAKERY': 'Panetteria',
    'shoppingCategory.FROZEN': 'Surgelati',
    'shoppingCategory.BEVERAGES': 'Bevande',
    'shoppingCategory.OTHER': 'Altro',
    'profile.authEyebrow': 'Autenticazione',
    'profile.authTitle': 'Account Saveur',
    'profile.authText': 'Accedi per sincronizzare ricette, preferiti, piani e spesa.',
    'profile.demoLogin': 'Account demo',
    'profile.login': 'Accedi',
    'profile.register': 'Registrati',
    'profile.fullName': 'Nome completo',
    'profile.email': 'Email',
    'profile.password': 'Password',
    'profile.createAccount': 'Crea account',
    'profile.logout': 'Esci',
    'profile.myCookbook': 'Il mio ricettario',
    'profile.emptyCookbook': 'Il ricettario è vuoto',
    'profile.createFirstRecipe': 'Crea la prima ricetta',
    'profile.favoriteEmpty': 'Le ricette preferite appariranno qui.',
    'profile.nextOnMenu': 'Prossimo menu',
    'profile.viewAll': 'Vedi tutto',
    'profile.showLess': 'Mostra meno',
    'profile.logoutSession': 'Chiudi sessione',
    'profile.weeklySchedule': 'Programma settimanale',
    'profile.weeklyScheduleText': 'Controlla i pasti pianificati.',
    'profile.openPlanner': 'Apri piano',
    'profile.accountDetails': 'Dettagli account',
    'profile.savedCollections': 'Collezioni salvate',
    'profile.preferences': 'Preferenze',
    'profile.systemInformation': 'Informazioni sistema',
    'profile.language': 'Lingua',
    'profile.signInWithAccount': 'Accedi con account',
    'profile.browseCatalog': 'Sfoglia catalogo',
    'profile.generateGroceries': 'Genera spesa',
    'meal.breakfast': 'Colazione',
    'meal.lunch': 'Pranzo',
    'meal.dinner': 'Cena',
    'meal.snack': 'Snack',
    'category.breakfast': 'Colazione',
    'category.main-dishes': 'Piatti principali',
    'category.desserts': 'Dolci',
    'category.salads': 'Insalate',
    'category.appetizers': 'Antipasti',
    'category.snacks': 'Snack',
  },
};

const languageNames: Record<LanguageCode, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

interface I18nContextType {
  language: LanguageCode;
  languages: typeof languageNames;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  categoryLabel: (category: { name: string; slug?: string }) => string;
}

const LANGUAGE_KEY = 'saveur_language';
const I18nContext = createContext<I18nContextType | undefined>(undefined);

function readInitialLanguage(): LanguageCode {
  const stored = localStorage.getItem(LANGUAGE_KEY) as LanguageCode | null;
  return stored && stored in dictionaries ? stored : 'en';
}

function interpolate(value: string, params: Record<string, string | number> = {}) {
  return Object.entries(params).reduce(
    (result, [key, paramValue]) => result.replaceAll(`{${key}}`, String(paramValue)),
    value
  );
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(readInitialLanguage);

  const value = useMemo<I18nContextType>(() => {
    const setLanguage = (nextLanguage: LanguageCode) => {
      localStorage.setItem(LANGUAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage;
      setLanguageState(nextLanguage);
    };

    const t = (key: TranslationKey, params?: Record<string, string | number>) => {
      const value = dictionaries[language][key] || dictionaries.en[key] || key;
      return interpolate(value, params);
    };

    const categoryLabel = (category: { name: string; slug?: string }) => {
      if (category.slug) {
        const key = `category.${category.slug}` as TranslationKey;
        return dictionaries[language][key] || category.name;
      }

      return category.name;
    };

    document.documentElement.lang = language;
    return { language, languages: languageNames, setLanguage, t, categoryLabel };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export type { TranslationKey };
