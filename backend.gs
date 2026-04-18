/**
 * API para el Inventario de VITAMEX S.A. de C.V.
 * Desarrollado para conectarse con un Frontend en GitHub Pages.
 */

// 1. OBTENER DATOS (Actualizado para leer inventario o catálogo)
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = e.parameter.sheet; // Especifica qué pestaña leer
  
  if (!sheetName) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "Error: Especifique una pestaña 'sheet'" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ "status": `Error: Pestaña '${sheetName}' no encontrada` }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  // Convertir filas en objetos JSON
  const jsonResponse = data.map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(jsonResponse))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. REGISTRAR MOVIMIENTOS (Este código permanece igual, funciona bien)
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetMovs = ss.getSheetByName("Movimientos");
  const sheetProds = ss.getSheetByName("Productos");
  
  // Parsear los datos enviados desde la web
  const params = JSON.parse(e.postData.contents);
  const { idProducto, tipo, cantidad, responsable, departamento } = params;
  const fecha = new Date();

  // A. Registrar en la pestaña de Movimientos
  sheetMovs.appendRow([fecha, idProducto, tipo, cantidad, responsable, departamento]);

  // B. Actualizar el Stock en la pestaña de Productos
  const dataProds = sheetProds.getDataRange().getValues();
  let productoEncontrado = false;

  for (let i = 1; i < dataProds.length; i++) {
    if (dataProds[i][0] == idProducto) { // Asumiendo que el ID está en la Columna A
      let stockActual = dataProds[i][3]; // Asumiendo que el Stock está en la Columna D
      
      if (tipo.toLowerCase() === "entrada") {
        stockActual += Number(cantidad);
      } else if (tipo.toLowerCase() === "salida") {
        stockActual -= Number(cantidad);
      }
      
      sheetProds.getRange(i + 1, 4).setValue(stockActual);
      productoEncontrado = true;
      break;
    }
  }

  const resultado = productoEncontrado ? "Éxito" : "Error: Producto no encontrado";
  
  return ContentService.createTextOutput(JSON.stringify({ "status": resultado }))
    .setMimeType(ContentService.MimeType.JSON);
}
