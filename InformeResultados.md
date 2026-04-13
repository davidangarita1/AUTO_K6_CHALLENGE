# Informe de Resultados - Análisis de Prueba de Carga

## Resumen ejecutivo

Se analizaron los resultados de una prueba de carga ejecutada sobre el servicio de transacción de balance (App Transaction Balance). La prueba involucró hasta 140 usuarios virtuales concurrentes, generando un total de 276,650 peticiones durante su ejecución.

## Datos generales

| Métrica             | Valor                   |
| ------------------- | ----------------------- |
| Total de peticiones | 276,650                 |
| TPS promedio        | 73.17/s                 |
| VUs máximos         | 140                     |
| Checks exitosos     | 97.55%                  |
| Tasa de error total | 2.44% (6,759 / 269,891) |

## Análisis de tiempos de respuesta

| Percentil | Valor    |
| --------- | -------- |
| Promedio  | 861.68ms |
| Mínimo    | 191.86ms |
| Mediana   | 613.42ms |
| p(90)     | 1.28s    |
| p(95)     | 1.57s    |
| Máximo    | 29.93s   |

### Observaciones

- El percentil 95 (1.57s) supera el umbral permitido de 1.5 segundos, lo que indica que al menos el 5% de las peticiones exceden el límite aceptable.
- El tiempo máximo de 29.93s evidencia la existencia de picos extremos de latencia, indicando posible saturación del servicio.
- Las respuestas exitosas (`expected_response: true`) tienen un p(95) de 1.42s, que sí cumple el umbral, lo que sugiere que la degradación está asociada a las respuestas fallidas.
- La diferencia significativa entre la mediana (613ms) y el promedio (861ms) indica una distribución asimétrica con colas largas hacia tiempos altos.

## Análisis de errores

| Etapa   | Tipo de error | Cantidad | Tasa       |
| ------- | ------------- | -------- | ---------- |
| Stage 0 | HTTP 5xx      | 1        | 0.000265/s |
| Stage 1 | HTTP 4xx      | 769      | 0.203409/s |
| Stage 1 | HTTP 5xx      | 5,987    | 1.583625/s |
| Stage 2 | HTTP 5xx      | 2        | 0.000529/s |

### Observaciones

- El **98.6%** de los errores (6,756 de 6,759) se concentran en el **Stage 1**, que corresponde a la fase de carga sostenida con mayor cantidad de VUs.
- Los errores HTTP 5xx (errores del servidor) representan la mayoría absoluta: 5,990 de 6,759 errores totales (88.6%).
- Los errores HTTP 4xx en Stage 1 (769) podrían estar relacionados con rate limiting o validaciones del servicio bajo carga.
- En Stage 0 y Stage 2 (ramp-up y ramp-down), los errores son prácticamente inexistentes, confirmando que el servicio solo falla bajo carga alta.

## Análisis del diagrama VUs vs http_reqs

Del punto observado en el diagrama (2025-04-24 02:02:00):

- Con **140 VUs** activos, el throughput alcanzado fue de **82.6 peticiones/s**.
- El TPS promedio general de la prueba fue de **73.17/s**, lo que indica que al llegar a 140 VUs, el throughput alcanzó su pico cercano al máximo.
- La relación VUs/TPS muestra que el sistema no escala linealmente: con 140 VUs se obtienen ~82.6 req/s, lo que significa que cada VU adicional genera rendimiento decreciente.
- Esto evidencia un **punto de saturación** en el que agregar más usuarios no incrementa proporcionalmente el throughput, sino que aumenta los tiempos de respuesta y la tasa de error.

## Conclusiones

1. **Tasa de error**: Con un 2.44%, la tasa de error se encuentra dentro del umbral aceptable del 3%, pero está cercana al límite.
2. **Tiempos de respuesta**: El p(95) general de 1.57s **supera el umbral de 1.5s**, indicando incumplimiento del SLA en este percentil. Sin embargo, las respuestas exitosas (p(95) = 1.42s) sí cumplen.
3. **Capacidad del servicio**: El servicio demuestra estabilidad hasta cierto nivel de carga, pero presenta degradación significativa cuando se alcanzan los 140 VUs.
4. **Concentración de errores**: La gran mayoría de los errores 5xx en Stage 1 indica que el servidor no tiene capacidad suficiente para la carga sostenida máxima.

## Recomendaciones

1. **Escalar infraestructura**: Aumentar los recursos del servidor o implementar autoescalado para soportar picos de 140+ VUs sin generar errores 5xx.
2. **Implementar circuit breaker**: Agregar un mecanismo de circuit breaker para manejar la degradación de forma controlada y evitar tiempos de respuesta extremos (29.93s).
3. **Optimizar el endpoint**: Investigar cuellos de botella en el servicio de Transaction Balance que causan la degradación bajo carga. Los tiempos máximos de ~30s sugieren posibles deadlocks o esperas en base de datos.
4. **Definir capacidad máxima**: Ejecutar pruebas incrementales para determinar el número exacto de VUs donde comienza la degradación y establecerlo como límite operativo.
5. **Rate limiting controlado**: Implementar rate limiting a nivel de API gateway antes de que el servidor se sature, retornando respuestas 429 controladas en lugar de errores 5xx.
6. **Monitorear en producción**: Configurar alertas cuando el throughput supere los 70 req/s o los VUs activos superen el punto de saturación identificado.
