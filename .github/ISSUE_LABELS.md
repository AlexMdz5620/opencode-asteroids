# Labels para Issues

El workflow `issue-formatter.yml` necesita las siguientes labels creadas en el repositorio.

## Labels de Tipo

| Label | Color | Descripción |
|-------|-------|-------------|
| `bug` | `d73a4a` | Algo no funciona como se espera |
| `enhancement` | `a2eeef` | Nueva función o mejora existente |
| `question` | `d876e3` | Pregunta o duda |
| `documentation` | `0075ca` | Mejoras o problemas con documentación |

## Labels de Prioridad

| Label | Color | Descripción |
|-------|-------|-------------|
| `priority: high` | `b60205` | Requiere atención inmediata |
| `priority: medium` | `fbca04` | Prioridad estándar |
| `priority: low` | `0e8a16` | Mejora menor, no urgente |

## Cómo Crear las Labels

### Opción 1: Usando GitHub CLI (recomendado)

```bash
# Labels de tipo
gh label create "bug" --color "d73a4a" --description "Algo no funciona como se espera"
gh label create "enhancement" --color "a2eeef" --description "Nueva función o mejora existente"
gh label create "question" --color "d876e3" --description "Pregunta o duda"
gh label create "documentation" --color "0075ca" --description "Mejoras o problemas con documentación"

# Labels de prioridad
gh label create "priority: high" --color "b60205" --description "Requiere atención inmediata"
gh label create "priority: medium" --color "fbca04" --description "Prioridad estándar"
gh label create "priority: low" --color "0e8a16" --description "Mejora menor, no urgente"
```

### Opción 2: Manualmente en GitHub

1. Ve a tu repositorio en GitHub
2. Haz clic en **Issues** → **Labels**
3. Haz clic en **New label**
4. Crea cada label con el nombre y color indicados arriba
5. Repite para todas las labels

## Verificación

Una vez creadas las labels, el workflow `issue-formatter.yml` funcionará automáticamente cuando se cree un issue nuevo.
