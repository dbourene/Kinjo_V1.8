/**
 * Service pour le traitement des fichiers Excel
 * Utilise ExcelJS pour le remplacement des variables dans les templates
 */

import * as ExcelJS from 'exceljs';

export interface ExcelVariables {
  [key: string]: string;
}

export class ExcelProcessor {
  
  /**
   * Traite un fichier Excel en remplaçant les variables
   * @param templateBlob - Le fichier template Excel
   * @param variables - Les variables à remplacer
   * @returns Le fichier Excel traité
   */
  static async processTemplate(
    templateBlob: Blob,
    variables: ExcelVariables
  ): Promise<Blob> {
    console.log('📝 Traitement du template Excel avec variables:', variables);
    
    try {
      // Vérifier que ExcelJS est disponible
      if (!ExcelJS) {
        throw new Error('ExcelJS n\'est pas disponible. Vérifiez l\'installation.');
      }

      console.log('📊 Initialisation d\'ExcelJS...');
      const workbook = new ExcelJS.Workbook();
      
      // Charger le template depuis le Blob
      console.log('📂 Chargement du template Excel...');
      const arrayBuffer = await templateBlob.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      
      console.log('✅ Template chargé, nombre de feuilles:', workbook.worksheets.length);
      
      // Parcourir toutes les feuilles
      workbook.eachSheet((worksheet, sheetId) => {
        console.log(`🔄 Traitement de la feuille ${sheetId}: "${worksheet.name}"`);
        
        let replacementCount = 0;
        
        // Parcourir toutes les lignes et cellules
        worksheet.eachRow((row, rowNumber) => {
          row.eachCell((cell, colNumber) => {
            if (cell.value && typeof cell.value === 'string') {
              let originalValue = cell.value;
              let newValue = originalValue;
              
              // Remplacer toutes les variables trouvées
              Object.entries(variables).forEach(([key, value]) => {
                if (newValue.includes(key)) {
                  newValue = newValue.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
                  replacementCount++;
                  console.log(`   ✏️  Cellule ${this.getColumnLetter(colNumber)}${rowNumber}: "${key}" → "${value}"`);
                }
              });
              
              // Mettre à jour la cellule si elle a changé
              if (newValue !== originalValue) {
                cell.value = newValue;
              }
            }
          });
        });
        
        console.log(`✅ Feuille "${worksheet.name}": ${replacementCount} remplacements effectués`);
      });
      
      // Générer le nouveau fichier Excel
      console.log('💾 Génération du fichier Excel modifié...');
      const buffer = await workbook.xlsx.writeBuffer();
      
      const processedBlob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      console.log('✅ Fichier Excel traité avec succès, taille:', processedBlob.size, 'bytes');
      return processedBlob;
      
    } catch (error) {
      console.error('❌ Erreur traitement Excel:', error);
      
      // En cas d'erreur avec ExcelJS, retourner le template original
      console.log('⚠️ Retour au template original en raison de l\'erreur');
      return templateBlob;
    }
  }
  
  /**
   * Convertit un numéro de colonne en lettre Excel (1 = A, 2 = B, etc.)
   */
  private static getColumnLetter(columnNumber: number): string {
    let columnName = '';
    while (columnNumber > 0) {
      const modulo = (columnNumber - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      columnNumber = Math.floor((columnNumber - modulo) / 26);
    }
    return columnName;
  }

  /**
   * Valide les variables requises pour l'Annexe 21
   */
  static validateAnnexe21Variables(variables: ExcelVariables): boolean {
    const requiredVariables = [
      '{{installations.denomination}}',
      '{{commune}}',
      '{{codepostal}}',
      '{{date}}',
      '{{installations.prm}}',
      '{{installations.titulaire}}',
      '{{installations.adresse}}',
      '{{producteurs.contact_mail}}',
      '{{installations.puissance}}'
    ];
    
    for (const required of requiredVariables) {
      if (!(required in variables)) {
        console.error(`❌ Variable manquante: ${required}`);
        return false;
      }
    }
    
    console.log('✅ Toutes les variables requises sont présentes');
    return true;
  }
  
  /**
   * Génère les variables pour l'Annexe 21
   */
  static generateAnnexe21Variables(
    operation: any,
    installation: any,
    producteur: any,
    currentDate: Date
  ): ExcelVariables {
    // Calcul de la date du 1er du mois suivant
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const dateFormatted = nextMonth.toLocaleDateString('fr-FR');
    
    // Extraction des données d'adresse
    const commune = this.extractCommuneFromAddress(installation.adresse);
    const codePostal = this.extractCodePostalFromAddress(installation.adresse);
    
    // Calcul du titulaire pour la feuille Producteurs
    const titulaireFeuille = producteur.registrationType === 'entreprise' && producteur.denominationUniteLegale
      ? producteur.denominationUniteLegale
      : producteur.contact_nom;
    
    const variables = {
      // Feuille "Opération PMO Mandataire"
      '{{installations.denomination}}': operation.denomination,
      '{{commune}}': commune,
      '{{codepostal}}': codePostal,
      '{{date}}': dateFormatted,
      
      // Feuille "Producteurs"
      '{{installations.prm}}': installation.prm,
      '{{installations.titulaire}}': titulaireFeuille,
      '{{installations.adresse}}': installation.adresse,
      '{{producteurs.siret}}': producteur.registrationType === 'entreprise' ? (producteur.siret || '') : '',
      '{{producteurs.contact_mail}}': producteur.contact_email,
      '{{installations.puissance}}': installation.puissance.toString()
    };
    
    console.log('📋 Variables générées pour l\'Annexe 21:', variables);
    return variables;
  }
  
  /**
   * Extraction du nom de commune depuis une adresse
   */
  private static extractCommuneFromAddress(adresse: string): string {
    // Extraction après le code postal
    const parts = adresse.split(/\d{5}/);
    if (parts.length > 1) {
      return parts[1].trim().split(',')[0].trim();
    }
    
    // Extraction basique - dernière partie après virgule
    const addressParts = adresse.split(',');
    return addressParts[addressParts.length - 1].trim();
  }
  
  /**
   * Extraction du code postal depuis une adresse
   */
  private static extractCodePostalFromAddress(adresse: string): string {
    const codePostalMatch = adresse.match(/\b(\d{5})\b/);
    return codePostalMatch ? codePostalMatch[1] : '75000';
  }
}