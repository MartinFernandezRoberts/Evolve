# Matriz de revisión visual

La página aislada `remaster-demo.html` acepta `?scenario=` para renderizar
datos mock separados del motor. No afecta ninguna partida ni activa el feature
flag.

| Escenario | Ruta | Cobertura |
| --- | --- | --- |
| Nuevo | `?scenario=new` | Terrenos disponibles y asentamiento vacío. |
| Pequeño | `?scenario=small` | Primera vivienda/granja y densidad baja. |
| Intermedio | `?scenario=intermediate` | Distritos mixtos y controles completos. |
| Industrial | `?scenario=industrial` | Crecimiento denso, electricidad y edificios activos. |
| Acuático | `?scenario=aquatic` | Perfil Octigoran, canales y habitantes abstractos. |

Revisar cada ruta a 1920×1080, 1366×768, 1024×768 y 390×844. En escritorio:
hover de nodo, clic, rueda, arrastre, `+`, `-`, `0`, tabulación y Enter/Espacio.
En móvil: toque en nodo, panel inferior y botones del navegador de distritos.
Repetir con `prefers-reduced-motion` y con `?remasterMetrics=1`; ocultar y
restaurar la pestaña para confirmar que la actividad se pausa y retoma.
