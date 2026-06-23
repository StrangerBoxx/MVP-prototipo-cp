# Backlog Refinado — Sprint 1 (MVP)

**Proyecto:** Sistema de Asignación y Ruteo de Técnicos · DES09
**Equipo:** Grupaso Corp · **Patrocinador:** Control Position SpA
**Alcance Sprint 1:** Vertical slice de **Planificación Diaria** (extremo a extremo, delgada pero completa).

---

## Contexto del refinamiento

Las 11 necesidades del backlog (heredadas de Hito 2) leían como **requisitos**, no como historias listas para sprint: sin criterios de aceptación, sin Definition of Done, sin borde de slice. Este documento las refina a **historias de usuario** con criterios de aceptación (Given/When/Then) y enlace al Objetivo Específico (OE) que validan.

### Alcance Sprint 1 (ante Épicas)

| Épica | Necesidades originales | ¿Se incluye? |
|---|---|---|
| Planificación Diaria | 1, 2, 3 | **Sí — las tres** |
| Planificación Reactiva | 4, 5, 6 | No (OE4, diferido) |
| Algoritmo de Optimización | 7, 8, 9 | **Sí — las tres** |
| API REST e Integración | 10, 11 | **10 sí; 11 contra API mock** |

### Flujo principal del MVP (HITL en cada etapa)

El control humano (Human-in-the-Loop) **no es opcional** y está presente en tres etapas: selección, edición y confirmación.

1. **Pre-selección automática (OTs y técnicos):** el módulo obtiene las OTs elegibles del día **y los técnicos disponibles** del sistema externo (la tabla `Disponibilidad` filtrada por el día objetivo), y pre-selecciona ambos conjuntos.
2. **El dispatcher confirma o modifica** ambas selecciones: qué OTs incluir **y qué técnicos considerar disponibles** (puede deseleccionar/re-agregar en cualquiera de los dos).
3. **El dispatcher dispara manualmente** la planificación optimizada (no se auto-ejecuta al cargar).
4. El sistema optimiza y **muestra las asignaciones propuestas y las rutas resultantes**.
5. **El dispatcher tiene control total de edición** (reordenar, mover entre técnicos, eliminar).
6. **El dispatcher tiene la última palabra** sobre cuándo confirmar.
7. Al confirmar, el módulo **vuelve a su homepage** (la vista de selección), ahora con las **rutas activas fijadas (read-only) arriba**. Este estado fijado es el futuro punto de entrada del modo reactivo.

> **Por qué existe el paso 7 (estado "después"):** por arquitectura, las asignaciones confirmadas están destinadas a las pantallas CRUD de OTs del *sistema externo* (write-back, OE6). Pero ese sistema no existe en Sprint 1 y el write-back está diferido. Sin el homepage post-confirmación, el dispatcher confirma y no ve ningún resultado tangible. Las rutas fijadas read-only son el **stand-in del MVP** para ese destino ausente, y de paso son el punto de entrada visual del modo reactivo. No es scope creep: es lo que hace que el slice sea demostrable dada la dependencia diferida.

### Decisiones de arquitectura que enmarcan el sprint

- **Optimizador sin estado.** Funciones puras: `(OTs, técnicos) → propuesta` y `(asignación) → válida/inválida + razón`. Sin DB, sin persistencia.
- **Estado en el frontend (`sessionStorage`).** Datos mock, selecciones, rutas propuestas, ediciones y flag de confirmación viven en la sesión del navegador. MVP single-session.
- **API externa mockeada.** El sistema del equipo externo aún no existe; se desarrolla contra un mock cuyo contrato controlamos. Forma de objetos (OT/técnico) a definir por Rodrigo; internos del optimizador por Álvaro.
- **Instancia de demo: pequeña — 2-3 técnicos, ~8-12 OTs.** Permite verificar el óptimo por enumeración exhaustiva (criterio de validación de OE1).
- **Geocodificación fuera de alcance.** El mock entrega lat/lng directamente.

---

## ÉPICA: Planificación (asignación y optimización) Diaria

### HU-01 — Pre-selección automática de OTs y técnicos del día
> Como dispatcher, quiero que el sistema obtenga y pre-seleccione automáticamente las OTs elegibles del día **y los técnicos disponibles**, para tener un punto de partida completo que pueda confirmar o ajustar antes de optimizar.

**Refinamiento:** la "selección automática" es *upstream* — el sistema externo (mock) sirve las OTs elegibles del día y los técnicos disponibles (tabla `Disponibilidad` filtrada por el día). El módulo pre-selecciona **ambos** conjuntos. La pre-selección es un **default editable**, no una automatización que elimine al humano: el dispatcher confirma o modifica ambas selecciones antes de disparar la optimización (HITL etapa 1).

**Disponibilidad de técnicos es binaria:** los técnicos están bajo un régimen laboral de disponibilidad permanente (pueden ser llamados en cualquier momento), por lo que "disponible para el día" es un in/out completo, no una fracción de turno. (El turno sí restringe el ruteo — ver HU-08 — pero la disponibilidad en sí es binaria.)

**Criterios de aceptación**
- **Dado** que existen OTs elegibles y técnicos disponibles para el día, **cuando** el dispatcher abre la planificación diaria, **entonces** el módulo obtiene ambos conjuntos desde la API (mock) y los pre-selecciona todos, sin intervención manual.
- **Dado** que se obtuvieron las OTs, **cuando** se muestran, **entonces** cada OT presenta al menos cliente, dirección y ventana de tiempo.
- **Dado** que se obtuvieron los técnicos, **cuando** se muestran, **entonces** cada técnico aparece pre-seleccionado y el dispatcher puede deseleccionarlo/re-agregarlo.
- **Dado** la pre-selección de OTs, **cuando** el dispatcher la revisa, **entonces** puede deseleccionar/re-agregar OTs antes de optimizar.
- **Dado** que la API no devuelve OTs o técnicos, **cuando** se carga la vista, **entonces** se muestra un estado vacío claro (sin error).

**TBD que viaja con la historia:** el estado exacto que define "elegible" para una OT (lo resuelve el equipo externo al traspasar el ítem).
**Valida:** OE3, OE6 (consumo). **Notas:** datos en `sessionStorage`.

---

### HU-02 — Optimización automática de asignaciones
> Como dispatcher, quiero que las OTs cargadas se asignen automáticamente a los técnicos de forma óptima, para obtener una propuesta de rutas sin armarlas a mano.

**Criterios de aceptación**
- **Dado** un conjunto de OTs y técnicos de turno, **cuando** el dispatcher ejecuta la optimización, **entonces** el módulo llama al endpoint del optimizador y recibe una propuesta donde cada OT queda asignada a un técnico y secuenciada.
- **Dado** que hay OTs que no pueden acomodarse de forma factible, **cuando** se recibe la propuesta, **entonces** esas OTs se reportan como pendientes/no asignables, sin descartarse ni forzarse.
- **Dado** que la propuesta llega, **cuando** se renderiza, **entonces** se muestra por técnico su secuencia de visitas.

**Valida:** OE1, OE2, OE3.

---

### HU-03 — Revisión y edición de rutas propuestas
> Como dispatcher, quiero ver y editar las rutas propuestas para validarlas antes de confirmar, manteniendo la responsabilidad sobre la decisión final (HITL).

**Criterios de aceptación**
- **Dado** una propuesta de rutas, **cuando** el dispatcher la revisa, **entonces** puede reordenar la secuencia de un técnico, mover una OT entre técnicos y eliminar una OT.
- **Dado** que el dispatcher edita la asignación, **cuando** confirma, **entonces** el módulo re-valida la factibilidad (ventana, turno, asignación única) vía el endpoint de confirmación **antes** de aceptar el plan.
- **Dado** que una edición manual produce una asignación infactible, **cuando** se confirma, **entonces** el sistema la rechaza/reporta como infactible, sin aceptarla.
- **Dado** un plan confirmado, **cuando** termina el flujo, **entonces** queda marcado como confirmado en `sessionStorage`.

**Valida:** OE3, OE5 (re-validación en confirmación).

---

## ÉPICA: Algoritmo de Optimización de Asignaciones

### HU-07 — Servicio de optimización VRPTW
> Como sistema, dado un conjunto de OTs y técnicos disponibles, debo calcular asignaciones óptimas que generen una ruta secuenciada por técnico, respetando ventanas de tiempo, turnos y minimizando la distancia recorrida.


**Criterios de aceptación**
- **Asignación única y secuenciada:** dado OTs y técnicos válidos, **cuando** se invoca el optimizador, **entonces** asigna cada OT a exactamente un técnico y produce una secuencia (ruta) por técnico.
- **No asignables como pendientes:** dado una OT que ninguna restricción permite acomodar, **cuando** se resuelve, **entonces** se reporta como no asignable (no se descarta ni se fuerza).
- **Ventanas de tiempo:** dado una OT con ventana de tiempo, **cuando** se agenda, **entonces** el inicio de la atención cae estrictamente dentro de la ventana acordada; si una ventana no puede satisfacerse, no se produce una asignación que la viole (se reporta pendiente).
- **Turnos:** dado el turno de un técnico, **cuando** se construye su ruta, **entonces** la ruta completa (salida → última atención → retorno requerido) cabe dentro del turno, sin excederlo.
- **Distancia en el objetivo:** dado las ubicaciones (lat/lng) de técnicos y OTs, **cuando** se optimiza, **entonces** la función objetivo incorpora la distancia/tiempo de viaje total, y entre dos asignaciones factibles prefiere la de menor costo.

**Valida:** OE1. **Notas:** OR-Tools (VRPTW), servicio Python sin estado; matriz de distancias a partir de lat/lng (sin geocodificación en Sprint 1).

---

## ÉPICA: API REST e Integración

### HU-08 — Exponer el optimizador como endpoints
> Como sistema, debo exponer el servicio de optimización como endpoints, para que la lógica viva detrás de un contrato y no en el frontend.

**Criterios de aceptación**
- **Dado** el servicio de optimización, **cuando** se despliega, **entonces** expone al menos un endpoint de **propuesta** (OTs+técnicos → asignaciones) y uno de **confirmación** (asignación → válida/inválida + razón).
- **Dado** un cliente distinto del frontend (p. ej. un cliente de prueba), **cuando** invoca los endpoints directamente, **entonces** completa el flujo propuesta→confirmación y obtiene un resultado equivalente al de la interfaz (la lógica no reside en el frontend).
- **Dado** una asignación infactible enviada a confirmación, **cuando** se procesa, **entonces** el endpoint la rechaza/reporta antes de aceptarla.

**Valida:** OE5, OE2. **Notas:** servicio sin estado; contrato interno a definir por Álvaro.

---

### HU-09 — Consumir la API (mock) del sistema externo
> Como sistema, debo consumir los endpoints provistos por el sistema externo para obtener las OTs y técnicos que requier

**Criterios de aceptación**
- **Dado** el mock de la API externa, **cuando** el módulo solicita OTs, **entonces** las obtiene conforme al contrato acordado, sin ingreso manual.
- **Dado** el mock de la API externa, **cuando** el módulo solicita técnicos disponibles, **entonces** los obtiene a partir de la tabla `Disponibilidad` filtrada por el día objetivo (disponibilidad binaria por técnico).
- **Dado** los datos recibidos (OTs y técnicos), **cuando** se presentan, **entonces** el dispatcher puede seleccionarlos, revisar la propuesta y confirmarla.

**Valida:** OE6 (consumo; el write-back al sistema externo se difiere). **TBD:** forma de OT/técnico y endpoint/forma de `Disponibilidad` (Rodrigo, ya "avanzando en la API").

---

## Resumen de cobertura de objetivos

| Historia | Épica | OE que valida |
|---|---|---|
| HU-01 | Diaria | OE3, OE6 |
| HU-02 | Diaria | OE1, OE2, OE3 |
| HU-03 | Diaria | OE3, OE5 |
| HU-07 | Algoritmo | OE1 |
| HU-08 | API/Integración | OE5, OE2 |
| HU-09 | API/Integración | OE6 (consumo) |

**Diferido a sprints posteriores:** HU 4-6 (Planificación Reactiva, OE4), geocodificación, write-back real al sistema externo, instancia realista (30-50 OTs), auth.

---

## Camino crítico del sprint

**Congelar el contrato del mock (forma de OT/técnico) es el Día 1.** Hasta que esté fijo, nadie paraleliza. Una vez congelado, corren en paralelo:
- **Frontend (Juan):** pantalla de planificación + capa `sessionStorage` (HU-01, 02, 03).
- **Optimizador (Álvaro):** servicio Python OR-Tools VRPTW + endpoints (HU-07, 08).
- **Backend/Integración (Rodrigo):** mock API + cableado (HU-09).
