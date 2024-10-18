import { test, expect } from "@playwright/test";
import pdfParse from "pdf-parse";
test("test", async ({ page }) => {
 await page.goto("https://www.bancocajasocial.com/");
 await page.getByRole("link", { name: "Empresas" }).click();
 await page
   .locator("#nav-wrapper div")
   .filter({ hasText: "Pagos y Recaudos" })
   .nth(2)
   .click();
 await page.getByRole("link", { name: "Recaudo", exact: true }).click();
 const [newPage] = await Promise.all([
   page.waitForEvent("popup"),
   page.getByRole("link", { name: "Enlace Reglamento de Recaudos" }).click(),
 ]);
 // Esperar a que el PDF se cargue
 await newPage.waitForLoadState("load");
 try {
   // Extraer el contenido del PDF directamente desde la memoria
   const pdfUrl = newPage.url();
   const pdfBuffer = await newPage.evaluate(async (pdfUrl) => {
     const response = await fetch(pdfUrl);
     if (!response.ok) {
       throw new Error(`Failed to fetch PDF: ${response.statusText}`);
     }
     const buffer = await response.arrayBuffer();
     return Array.from(new Uint8Array(buffer));
   }, pdfUrl);
   // Convertir el array a Uint8Array
   const uint8Array = new Uint8Array(pdfBuffer);
   // Leer el contenido del PDF
   const pdfData = await pdfParse(uint8Array);
   // Validar el título del PDF
   const expectedTitle = "REGLAMENTO RECAUDO";
   expect(pdfData.text).toContain(expectedTitle);
 } catch (error) {
   console.error("Error processing PDF:", error);
   throw error;
 }
});