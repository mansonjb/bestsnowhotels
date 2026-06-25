# Indexation Google Search Console (GSC)

Le site est techniquement prêt pour Google : sitemap complet (~7 400 URL, 5 langues,
hreflang + x-default), robots.txt qui pointe le sitemap, JSON-LD sur toutes les pages,
GA4 et Clarity déjà installés. Il manque seulement les actions côté compte Google,
qui ne peuvent pas être automatisées sans tes identifiants. Voici le chemin le plus
court.

## 1. Ajouter et vérifier la propriété (5 min, une seule fois)

Va sur https://search.google.com/search-console et "Ajouter une propriété".

Deux choix de propriété :
- **Domaine** (`bestsnowhotels.com`) : couvre www/non-www + http/https + tous les
  sous-domaines. Le plus robuste. Vérification par **enregistrement DNS TXT** chez ton
  registrar (ou chez Vercel si le DNS y est géré). Recommandé.
- **Préfixe d'URL** (`https://www.bestsnowhotels.com/`) : plus simple, mais ne couvre
  que cette variante exacte.

Méthodes de vérification, de la plus simple à la plus robuste :

1. **Google Analytics (zéro code, recommandé en premier).** GA4 est déjà posé sur le
   site (`G-L8WQTP6VZ8`). Si le compte Google qui ouvre la Search Console est le même
   que celui qui possède ce GA4, choisis la méthode "Google Analytics" et c'est validé
   en un clic. Rien à déployer.
2. **Balise HTML (déjà câblée).** GSC te donne un token du type
   `<meta name="google-site-verification" content="XXXXXXXX" />`. Copie juste la valeur
   `content`, mets-la dans la variable d'environnement Vercel **`GOOGLE_SITE_VERIFICATION`**,
   redeploie, puis clique "Vérifier". Le `<meta>` est rendu sur toutes les pages
   automatiquement (voir `app/[locale]/layout.tsx`).
3. **DNS TXT (pour une propriété Domaine).** Ajoute le TXT fourni par GSC sur la zone
   DNS, attends la propagation, clique "Vérifier".

## 2. Soumettre le sitemap (30 s)

Une fois la propriété vérifiée :
- Search Console > **Sitemaps** > saisir `sitemap.xml` > Envoyer.
- URL complète : `https://www.bestsnowhotels.com/sitemap.xml`

Google met quelques jours à le lire entièrement, puis crawle en continu. Ne resoumets
pas en boucle, c'est inutile.

## 3. Forcer l'indexation des pages prioritaires (optionnel, accélère le début)

Dans la barre "Inspecter une URL" en haut de GSC, colle une URL importante (home,
`/en/destinations`, quelques grosses stations), puis "Demander une indexation". Quota
d'environ 10 à 12 par jour, donc concentre-toi sur :
- `https://www.bestsnowhotels.com/en`
- `https://www.bestsnowhotels.com/en/destinations`
- les 8 à 10 stations les plus recherchées (val-thorens, zermatt, st-anton, courchevel...)

Le reste se fait tout seul via le sitemap + le maillage interne.

## 4. (Avancé) Automatiser via l'API : `scripts/gsc.mjs`

Sans aucune dépendance npm. Permet de soumettre le sitemap, vérifier l'état
d'indexation d'URL, et tirer les stats de recherche depuis le terminal (ou un cron).

Setup du compte de service (une fois) :
1. Google Cloud Console > nouveau projet > active **"Google Search Console API"**.
2. Crée un **compte de service**, génère une **clé JSON**, télécharge-la.
3. Dans GSC > Paramètres > **Utilisateurs et autorisations**, ajoute l'adresse
   `client_email` du compte de service en **Propriétaire** (ou Utilisateur complet).
4. Pointe le script sur la clé (jamais commitée, déjà dans `.gitignore`) :
   ```bash
   export GSC_SERVICE_ACCOUNT=/chemin/vers/cle.json
   # propriété Domaine ? :
   # export GSC_SITE_URL="sc-domain:bestsnowhotels.com"
   ```

Commandes :
```bash
node scripts/gsc.mjs status            # sitemaps soumis + nb d'URL + erreurs
node scripts/gsc.mjs submit-sitemap    # (re)soumettre /sitemap.xml
node scripts/gsc.mjs inspect <url>     # état d'indexation d'une URL
node scripts/gsc.mjs coverage 12       # inspecte les 12 stations top + home/index
node scripts/gsc.mjs analytics 28      # top pages + requêtes (28 derniers jours)
```

`analytics` est ce qu'il faut surveiller dans le temps : tant que les impressions
montent, l'indexation avance. Au démarrage c'est normal d'avoir "no data yet".

## Ce que GSC ne réglera pas

L'indexation ouvre la porte, mais le classement vient surtout des **backlinks** et de
la fraîcheur du contenu. IndexNow (déjà branché) gère Bing/Yandex. Google n'a pas
d'équivalent ouvert : c'est sitemap + inspection + liens entrants. La prochaine vraie
manette de croissance, après cette mise en place, ce sont les backlinks.
