# Dossier rapport LaTeX Saveur

Fichiers principaux :

- `RAPPORT_SAVEUR_COMPLET.tex` : rapport académique complet en français.
- `MATRICE_CONFORMITE.tex` : matrice de conformité aux consignes.
- `LISTE_CAPTURES_A_PRODUIRE.tex` : plan des captures finales à insérer.
- `INFORMATIONS_A_COMPLETER.tex` : données que le dépôt ne permet pas de connaître.
- `REFERENCES_TECHNIQUES.tex` : références officielles utilisées.
- `figures/` : dossier prévu pour les captures finales.

Compilation recommandée dans MiKTeX/Texmaker :

```powershell
pdflatex RAPPORT_SAVEUR_COMPLET.tex
pdflatex RAPPORT_SAVEUR_COMPLET.tex
```

`pdflatex` n'a pas été trouvé dans le terminal au moment de l'audit. Si MiKTeX est installé mais non reconnu, ouvrir le fichier `.tex` dans Texmaker ou vérifier que MiKTeX est dans le PATH Windows.
