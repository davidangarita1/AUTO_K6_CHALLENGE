# Reto de Pruebas de Rendimiento con K6

## Versiones de tecnologías

| Tecnología | Versión |
|------------|---------|
| Node.js    | v24.13.1 |
| pnpm       | 10.33.0 |
| k6         | v1.7.1  |

## Requisitos previos

- Instalar [Node.js](https://nodejs.org/)
- Instalar [pnpm](https://pnpm.io/installation)
- Instalar [k6](https://grafana.com/docs/k6/latest/get-started/installation/)

## Instalación

```bash
pnpm install
```

## Ejecución de pruebas

### Prueba de carga al login

```bash
pnpm test:login
```

### Con salida a JSON

```bash
pnpm test:login:json
```

### Con salida a CSV

```bash
pnpm test:login:csv
```

## Criterios de aceptación

- TPS objetivo: >= 20
- Tiempo de respuesta máximo: 1.5 segundos (p95)
- Tasa de error aceptable: < 3%