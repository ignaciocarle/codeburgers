  # Codeburgers
Codeburgers es un simulador de ecommerce creado con la finalidad de ser el trabajo final integrador del curso de Javascript de Coderhouse.

El proyecto está realizado completamente con HTML, CSS y Javascript vanilla.


  ## Funcionalidad
El simulador permite cargar productos al carrito y ver el mismo, teniendo la posibilidad de borrar un producto, borrar todos los productos, o finalizar la compra.

El listado de productos disponibles está implementado en un objeto literal en el archivo app.js que simula ser una base de datos incluyendo metodos de actualización de stock y busqueda de productos.

El carrito se maneja con una variable state que contiene una propiedad de tipo Order que contiene toda los datos y métodos para obtenerlos.

  # Nota
Se utiliza LocalStorage para guardar tanto el listado de productos como el carrito por lo que si se desea recuperar el stock "comprado" se debe eliminar el LocalStorage de la página.
