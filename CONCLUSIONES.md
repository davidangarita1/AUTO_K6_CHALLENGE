# Conclusiones - Prueba de Carga Login

## Resultados obtenidos

| Métrica                         | Objetivo | Resultado | Estado |
| ------------------------------- | -------- | --------- | ------ |
| TPS (transacciones por segundo) | >= 20    | ~55.5 TPS | Cumple |
| Tiempo de respuesta p(95)       | < 1500ms | 355.78ms  | Cumple |
| Tasa de error                   | < 3%     | 0.00%     | Cumple |

## Hallazgos

### Rendimiento del endpoint

- El endpoint `/auth/login` de FakeStoreAPI respondió de forma estable durante toda la prueba con un promedio de 324.75ms.
- El tiempo máximo registrado fue de 711.37ms, muy por debajo del umbral de 1500ms.
- No se presentaron errores HTTP durante la ejecución con 25 VUs concurrentes.

### Comportamiento bajo carga

- Con un ramp-up gradual de 0 a 25 usuarios virtuales, el servicio mantuvo tiempos de respuesta consistentes.
- La diferencia entre la mediana (319.57ms) y el percentil 95 (355.78ms) es mínima, lo que indica estabilidad en los tiempos de respuesta.
- Se alcanzaron ~55 TPS, superando ampliamente el objetivo de 20 TPS.

### Datos parametrizados

- Los 5 usuarios del archivo CSV se distribuyeron correctamente entre los VUs.
- Todas las credenciales generaron tokens válidos, confirmando que los datos de prueba son correctos.

## Conclusiones

1. El servicio de login de FakeStoreAPI cumple con todos los criterios de aceptación definidos.
2. El servicio soporta al menos 25 usuarios concurrentes sin degradación de rendimiento.
3. La tasa de error del 0% indica alta estabilidad del servicio bajo la carga aplicada.
4. Los tiempos de respuesta se mantienen consistentes independientemente de la cantidad de usuarios virtuales activos.
