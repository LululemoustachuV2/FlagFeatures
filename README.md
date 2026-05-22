# FlagFeatures

API REST NestJS pour gérer des feature flags, des utilisateurs, des groupes et des environnements, avec évaluation par utilisateur et journal d’audit.

## Prérequis

- Node.js 20+
- npm

## Installation et lancement

```bash
npm install
npm run start:dev
```

L’API écoute sur `http://localhost:6767`. Toutes les routes sont sous le préfixe `/api`. La doc Swagger est sur `/api/docs`.

Build production :

```bash
npm run build
npm start
```

## Tests

```bash
npm test              # unit + e2e
npm run test:unit     # logique d’évaluation uniquement
npm run test:e2e      # intégration HTTP
```

## Endpoints

### Santé

| Méthode | Route |
|---------|-------|
| GET | `/api/health` |
| GET | `/api/version` |

### Utilisateurs

| Méthode | Route |
|---------|-------|
| POST | `/api/users/add-user` |
| GET | `/api/users/all` |
| GET | `/api/users/get-by-id/:id` |
| PATCH | `/api/users/update/:id` |
| DELETE | `/api/users/delete/:id` |

### Groupes

| Méthode | Route |
|---------|-------|
| POST | `/api/groups/add-group` |
| GET | `/api/groups/all` |
| GET | `/api/groups/get-by-id/:id` |
| PATCH | `/api/groups/update/:id` |
| DELETE | `/api/groups/delete/:id` |
| POST | `/api/groups/:id/add-user/:userId` |
| DELETE | `/api/groups/:id/remove-user/:userId` |
| GET | `/api/groups/:id/users` |

### Environnements

| Méthode | Route |
|---------|-------|
| POST | `/api/environments/add-environment` |
| GET | `/api/environments/all` |
| GET | `/api/environments/get-by-name/:name` |
| PATCH | `/api/environments/update/:name` |
| DELETE | `/api/environments/delete/:name` |

### Features

| Méthode | Route |
|---------|-------|
| POST | `/api/features/add-feature` |
| GET | `/api/features/all` |
| GET | `/api/features/get-by-key/:key` |
| PATCH | `/api/features/update/:key` |
| DELETE | `/api/features/delete/:key` |
| PATCH | `/api/features/:key/enable` |
| PATCH | `/api/features/:key/disable` |
| GET | `/api/features/:key/evaluate?userId=&env=` |
| GET | `/api/features/:key/environments/:env/config` |
| PUT | `/api/features/:key/environments/:env/config` |
| DELETE | `/api/features/:key/environments/:env/config` |
| GET | `/api/features/:key/audit-logs` |

### Audit logs

| Méthode | Route |
|---------|-------|
| GET | `/api/audit-logs` |

## Variables d'environnement

Aucune. Le port `6767` est codé en dur dans `src/main.ts`. Les données sont stockées en mémoire et disparaissent au redémarrage du process.
