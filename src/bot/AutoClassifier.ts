// AutoClassifier.ts

import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { SpreadsheetManager } from "../spreadsheet/SpreadsheetManager.js";
import { createLogger } from "../utils/logger.js";
import { buildMerchantCategoryMap } from "./CommonClassifier.js";

const logger = createLogger("AutoClassifier");

export class AutoClassifier {
private spreadsheetManager: SpreadsheetManager;

constructor(spreadsheetManager: SpreadsheetManager) {
    this.spreadsheetManager = spreadsheetManager;
}

async classifyTransactions(sheetName: string) {
    try {
    logger("Auto-classification process started...");

    const rows = await this.spreadsheetManager.getRows(sheetName);
    const merchantCategoryMap = await buildMerchantCategoryMap(
        this.spreadsheetManager,
        "map",
    );

    let classifiedCount = 0;
    const rowsToUpdate: GoogleSpreadsheetRow[] = []; // Explicitly type rows

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const description = row.get("description")?.trim().toLowerCase() || "";

        logger(`Processing row ${index + 1}: ${description}`);
        
        if (description && merchantCategoryMap[description]) {
        const category = merchantCategoryMap[description];
        row.set("classification", category);
        rowsToUpdate.push(row); // Collect the row to update later
        classifiedCount++;
        logger(`Row ${index + 1} classified as ${category}.`);
        } else {
        logger(`Row ${index + 1} could not be auto-classified.`);
        }
    }

    // Batch save all classified rows at once
    if (rowsToUpdate.length > 0) {
        await this.spreadsheetManager.saveRows(rowsToUpdate);
    }

    logger(
        `Auto-classification completed. Classified ${classifiedCount} out of ${rows.length} rows.`,
    );
    return classifiedCount;
    } catch (error) {
    logger(`Error in classifyTransactions: ${error.message}`);
    throw error;
    }
  }
}
