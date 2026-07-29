# Hoja de ruta del remaster visual

> Esta hoja de ruta no autoriza cambios de balance ni de motor. Cada fase queda detrás del feature flag y conserva la interfaz clásica.

## Principios de entrega

- Entregas verticales, reversibles y con la UI clásica disponible.
- El motor y `actions` existentes son la única fuente de reglas.
- Primero estructura, accesibilidad y equivalencia funcional; después riqueza de assets y animación.
- No incorporar Canvas/PixiJS sin un cuello de botella medido del enfoque SVG.

## Fase 0 — Fundación documental

- Documentar arquitectura, integración, dirección de arte, límites legales y comprobaciones.
- Ejecutar instalación limpia y build Windows.
- Definir flag externo al guardado y contrato del adaptador.

Resultado: esta entrega.

## Fase 1 — Vertical slice: Civilización planetaria

Alcance único del MVP:

- Toggle apagado por defecto entre ciudad clásica y pueblo visual.
- Escena SVG/DOM para el tab `#city`, con un mapa original de un solo bioma y caminos/nodos decorativos.
- Nodos para los edificios planetarios actualmente visibles desde `actions.city`; los no representados aún aparecen en una lista de compatibilidad dentro del modo visual.
- Un nodo muestra nombre, cantidad, estado de energía y asequibilidad calculados por el adaptador.
- Un clic de construcción entra por el wrapper de la acción original, incluidos multiplicadores y cola.
- HUD pequeño de recursos y población de sólo lectura.
- Escape, navegación por teclado, foco visible, texto alternativo y retorno inmediato al modo clásico.

Criterios de salida:

- Una compra desde la escena equivale a comprar el mismo edificio desde la tarjeta clásica.
- Tecnologías o requisitos que cambian la ciudad actualizan el mapa sin recargar la partida.
- Importar/exportar una partida mantiene el mismo formato y el modo clásico funciona sin cambios.
- `npm run build-win` termina correctamente.

No forma parte del MVP: espacio, interstellar, galaxia, portal, Eden, Tau Ceti, colocación libre, trabajadores individuales animados, clima simulado propio, audio ni motor de combate visual.

## Fase 2 — Cobertura planetaria y estados

- Variantes visuales por bioma, estación y clima ya presentes en `global.city`.
- Representación por distrito/categoría sin cambiar requisitos ni orden de acciones.
- Paneles de detalles, colas, edificios con energía y opciones especiales delegadas.
- Estados vacíos, razas/rasgos alternativos y desafíos planetarios.

## Fase 3 — Calidad y accesibilidad

- Medición de render, actualización diferencial y pausa cuando la pestaña no está visible.
- Pruebas de adaptador y navegador para construcción, cola, teclado, idioma, guardado y reset.
- Auditoría de assets, manifest de procedencia y contraste/lectores de pantalla.

## Fase 4 — Expansiones de interfaz

- Evaluar regiones no planetarias una por una, cada una como vertical slice independiente.
- Sólo después de medir: decidir si una subcapa de fondo requiere Canvas o PixiJS.
- Mantener el mismo adaptador y los mismos comandos de acción; ningún mapa añade reglas de juego.

## Riesgos que se revisan por fase

- Acciones con efectos especiales, energía y colas pueden no ser equivalentes si se invoca `action()` directamente: usar siempre el despacho original.
- `drawCity()` recrea nodos DOM: el controlador debe tolerar montaje/desmontaje repetido.
- El estado tiene muchas combinaciones de raza, planeta y desafío: se requiere fallback visual genérico, no exclusiones mecánicas.
- Assets demasiado grandes o animación continua pueden afectar dispositivos modestos; mantener límites de tamaño, reducción de movimiento y perfilado.
