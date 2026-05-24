FabLabEcuador.org

## Editar laboratorios del mapa

Los puntos del mapa se editan en `assets/labs.json`.

Cada laboratorio usa esta estructura:

```json
{
  "name": "Nombre del laboratorio",
  "slug": "slug-en-fablabs-io",
  "city": "Ciudad",
  "province": "Provincia",
  "lat": -0.208041,
  "lng": -78.491218,
  "status": "active"
}
```

Estados disponibles:

- `active`: Activo
- `planned`: Planificado
- `registered`: Registrado
