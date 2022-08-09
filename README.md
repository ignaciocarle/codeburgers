# Codeburgers

Codeburgers es un simulador de ecommerce creado con la finalidad de ser el trabajo final integrador del curso de Javascript de Coderhouse.

El proyecto está realizado completamente con HTML, CSS y Javascript vanilla.
Solo se hizo uso de la librería Toastify para generar alertas visuales no bloqueantes.

## Funcionalidad

El simulador permite cargar productos al carrito y ver el mismo, teniendo la posibilidad de borrar un producto, borrar todos los productos, o finalizar la compra.
Se maneja un stock que se actualiza a medida que se compran productos.

## Estructura

El listado de productos disponibles está implementado en un archivo .json que se obtiene a través de fetch.
Simula ser una base de datos incluyendo metodos de actualización de stock y busqueda de productos.

El carrito se maneja con una variable global "state" que contiene una propiedad "cart", instancia de la clase Cart, que contiene toda la información del carrito y métodos para obtenerla.

La funcionalidad de la página se realizó con funciones independientes para realizar cada acción y una función "updateState" para actualizar el estado y todos los elementos de la UI.

La renderización de los elementos del DOM se realiza dinámicamente con funciones de renderizado que son llamadas con la carga inicial de la página y cada vez que se ejecuta "updateState".

# Nota

Se utiliza LocalStorage para guardar tanto el listado de productos como el carrito por lo que si se desea recuperar el stock "comprado" se debe eliminar el LocalStorage de la página.
