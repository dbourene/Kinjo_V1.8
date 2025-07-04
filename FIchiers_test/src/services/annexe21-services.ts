import { supabase } from '../lib/supabase';
import { ExcelProcessor } from './excel-processor';

interface OperationData {
  denomination: string;
  id_acc_enedis: string;
  numero_acc?: string;
}

interface InstallationData {
  id: string;
  producteur_id: string;
  prm: string;
  puissance: number;
  adresse: string;
  titulaire: string;
}

interface ProducteurData {
  id: string;
  contact_email: string;
  contact_nom: string;
  contact_prenom: string;
  siret?: string;
  denominationUniteLegale?: string;
  libelleVoieEtablissement?: string;
  registrationType: 'particulier' | 'entreprise';
}

export class Annexe21Service {
  
  /**
   * Étape 1 : Calcul et mise à jour du titulaire de l'installation
   */
  static async updateInstallationTitulaire(
    installationId: string, 
    producteur: ProducteurData
  ): Promise<string> {
    console.log('🏷️ Calcul du titulaire pour l\'installation:', installationId);
    
    // Logique de calcul du titulaire selon les règles métier
    let titulaire: string;
    
    if (producteur.denominationUniteLegale) {
      // Cas 1 : Dénomination de l'unité légale existe
      titulaire = producteur.denominationUniteLegale;
    } else if (producteur.libelleVoieEtablissement) {
      // Cas 2 : Libellé voie établissement existe
      titulaire = producteur.libelleVoieEtablissement;
    } else {
      // Cas 3 : Utiliser le nom de contact
      titulaire = producteur.contact_nom;
    }
    
    console.log('✅ Titulaire calculé:', titulaire);
    
    // Mise à jour en base de données
    const { error } = await supabase
      .from('installations')
      .update({ titulaire })
      .eq('id', installationId);
    
    if (error) {
      console.error('❌ Erreur mise à jour titulaire:', error);
      throw new Error(`Erreur lors de la mise à jour du titulaire: ${error.message}`);
    }
    
    return titulaire;
  }
  
  /**
   * Étape 2 : Création de l'opération ACC
   */
  static async createOperationACC(
    installation: InstallationData,
    titulaire: string
  ): Promise<OperationData> {
    console.log('🏭 Création de l\'opération ACC pour l\'installation:', installation.id);
    
    // Extraction du département depuis l'adresse
    const departement = this.extractDepartmentFromAddress(installation.adresse);
    console.log('📍 Département extrait:', departement);
    
    // Récupération de l'ID ACC ENEDIS selon le département
    const { data: coordonneesEnedis, error: coordError } = await supabase
      .from('coordonnees_enedis')
      .select('id_acc_enedis')
      .eq('departement_numero_acc_enedis', departement.toString())
      .single();
    
    if (coordError || !coordonneesEnedis) {
      console.error('❌ Erreur récupération coordonnées ENEDIS:', coordError);
      throw new Error(`Coordonnées ENEDIS non trouvées pour le département ${departement}`);
    }
    
    // Extraction du nom de commune depuis l'adresse
    const commune = this.extractCommuneFromAddress(installation.adresse);
    
    // Génération de la dénomination : titulaire_commune
    const denomination = `${titulaire}_${commune}`;
    
    console.log('📋 Dénomination générée:', denomination);
    
    // Insertion dans la table operations
    const operationData = {
      denomination,
      id_acc_enedis: coordonneesEnedis.id_acc_enedis,
      statut: 1, // Demande envoyée
      created_at: new Date().toISOString()
    };
    
    const { data: operation, error: opError } = await supabase
      .from('operations')
      .insert([operationData])
      .select('*')
      .single();
    
    if (opError) {
      console.error('❌ Erreur création opération:', opError);
      throw new Error(`Erreur lors de la création de l'opération: ${opError.message}`);
    }
    
    console.log('✅ Opération ACC créée:', operation);
    
    return {
      denomination,
      id_acc_enedis: coordonneesEnedis.id_acc_enedis,
      numero_acc: operation.numero_acc
    };
  }
  
  /**
   * Étape 3 : Génération du fichier Annexe 21
   */
  static async generateAnnexe21File(
    operation: OperationData,
    installation: InstallationData,
    producteur: ProducteurData
  ): Promise<string> {
    console.log('📄 Génération du fichier Annexe 21...');
    
    try {
      // 1. Vérifier l'authentification
      console.log('🔐 Vérification de l\'authentification...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('❌ Erreur d\'authentification:', authError);
        throw new Error(`Erreur d'authentification: ${authError.message}`);
      }
      
      if (!session) {
        console.error('❌ Aucune session active');
        throw new Error('Utilisateur non authentifié - aucune session active');
      }
      
      console.log('✅ Utilisateur authentifié');
      
      // 2. Téléchargement du template avec gestion d'erreur améliorée
      const templateFileName = 'template_annexe21.xlsx';
      const templatePath = `type/${templateFileName}`;
      
      console.log('📁 Bucket utilisé: annexes21');
      console.log('📁 Chemin du fichier template:', templatePath);
      
      console.log('⬇️ Téléchargement du template depuis Storage...');
      
      // Essayer d'abord avec download()
      let templateData: Blob;
      try {
        const { data, error: downloadError } = await supabase.storage
          .from('annexes21')
          .download(templatePath);
        
        if (downloadError) {
          console.warn('⚠️ Échec avec download(), tentative avec URL publique...');
          throw downloadError;
        }
        
        templateData = data;
        console.log('✅ Template téléchargé avec download(), taille:', templateData.size, 'bytes');
        
      } catch (downloadError) {
        console.log('🔄 Tentative avec URL publique...');
        
        // Fallback: utiliser l'URL publique
        const { data: urlData } = supabase.storage
          .from('annexes21')
          .getPublicUrl(templatePath);
        
        console.log('🔗 URL publique générée:', urlData.publicUrl);
        
        const response = await fetch(urlData.publicUrl);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        templateData = await response.blob();
        console.log('✅ Template téléchargé via URL publique, taille:', templateData.size, 'bytes');
      }
      
      // 3. Génération du nom de fichier avec date actuelle
      const currentDate = new Date();
      const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // AAAAMMJJ
      const fileName = `${operation.denomination}_${dateString}_ANNEXE21.xlsx`;
      
      console.log('📝 Nom du fichier de sortie:', fileName);
      
      // 4. Traitement du fichier Excel avec remplacement des variables
      console.log('🔄 Traitement du fichier Excel...');
      const processedFile = await this.processExcelTemplate(
        templateData,
        operation,
        installation,
        producteur,
        currentDate
      );
      
      // 5. Upload du fichier traité vers Storage
      const outputPath = `operations/${fileName}`;
      console.log('⬆️ Upload vers bucket annexes21, chemin:', outputPath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('annexes21')
        .upload(outputPath, processedFile, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ Erreur upload fichier:', uploadError);
        throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
      }
      
      console.log('✅ Fichier uploadé avec succès:', uploadData);
      
      // 6. Génération de l'URL publique
      const { data: urlData } = supabase.storage
        .from('annexes21')
        .getPublicUrl(outputPath);
      
      console.log('✅ Fichier Annexe 21 généré:', urlData.publicUrl);
      
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('❌ Erreur génération Annexe 21:', error);
      throw error;
    }
  }
  
  /**
   * Étape 4 : Mise à jour de l'URL dans la table operations
   */
  static async updateOperationUrl(operationId: string, annexe21Url: string): Promise<void> {
    console.log('🔗 Mise à jour URL Annexe 21 dans l\'opération:', operationId);
    
    const { error } = await supabase
      .from('operations')
      .update({ url_annexe21: annexe21Url })
      .eq('id', operationId);
    
    if (error) {
      console.error('❌ Erreur mise à jour URL:', error);
      throw new Error(`Erreur lors de la mise à jour de l'URL: ${error.message}`);
    }
    
    console.log('✅ URL Annexe 21 mise à jour');
  }
  
  /**
   * Processus complet de génération Annexe 21
   */
  static async generateCompleteAnnexe21(
    installationId: string,
    producteurData: ProducteurData
  ): Promise<{ operationId: string; annexe21Url: string }> {
    console.log('🚀 Début du processus complet Annexe 21 pour installation:', installationId);
    
    try {
      // Récupération des données de l'installation
      const { data: installation, error: instError } = await supabase
        .from('installations')
        .select('*')
        .eq('id', installationId)
        .single();
      
      if (instError || !installation) {
        throw new Error(`Installation non trouvée: ${instError?.message}`);
      }
      
      // Étape 1 : Mise à jour du titulaire
      const titulaire = await this.updateInstallationTitulaire(installationId, producteurData);
      
      // Mise à jour des données installation avec le titulaire
      const installationWithTitulaire = { ...installation, titulaire };
      
      // Étape 2 : Création de l'opération ACC
      const operation = await this.createOperationACC(installationWithTitulaire, titulaire);
      
      // Étape 3 : Génération du fichier Annexe 21
      const annexe21Url = await this.generateAnnexe21File(
        operation,
        installationWithTitulaire,
        producteurData
      );
      
      // Récupération de l'ID de l'opération créée
      const { data: operationRecord, error: opFindError } = await supabase
        .from('operations')
        .select('id')
        .eq('denomination', operation.denomination)
        .single();
      
      if (opFindError || !operationRecord) {
        throw new Error('Opération créée non trouvée');
      }
      
      // Étape 4 : Mise à jour de l'URL
      await this.updateOperationUrl(operationRecord.id, annexe21Url);
      
      console.log('🎉 Processus Annexe 21 terminé avec succès');
      
      return {
        operationId: operationRecord.id,
        annexe21Url
      };
      
    } catch (error) {
      console.error('❌ Erreur dans le processus Annexe 21:', error);
      throw error;
    }
  }
  
  /**
   * Traitement du fichier Excel avec remplacement des variables - UTILISE EXCELJS
   */
  private static async processExcelTemplate(
    templateData: Blob,
    operation: OperationData,
    installation: InstallationData,
    producteur: ProducteurData,
    currentDate: Date
  ): Promise<Blob> {
    console.log('📝 Traitement du template Excel avec ExcelJS...');
    
    // Générer les variables pour le remplacement
    const variables = ExcelProcessor.generateAnnexe21Variables(
      operation,
      installation,
      producteur,
      currentDate
    );
    
    // Valider les variables
    if (!ExcelProcessor.validateAnnexe21Variables(variables)) {
      console.warn('⚠️ Variables manquantes, utilisation du template original');
      return templateData;
    }
    
    // Traiter le fichier Excel avec ExcelJS
    const processedFile = await ExcelProcessor.processTemplate(templateData, variables);
    
    console.log('✅ Fichier Excel traité avec ExcelJS');
    
    return processedFile;
  }
  
  /**
   * Extraction du numéro de département depuis une adresse
   */
  private static extractDepartmentFromAddress(adresse: string): number {
    console.log('🔍 Extraction du département depuis l\'adresse:', adresse);
    
    // Extraction du code postal (5 premiers chiffres)
    const codePostalMatch = adresse.match(/\b(\d{5})\b/);
    if (codePostalMatch) {
      const codePostal = codePostalMatch[1];
      // Les 2 premiers chiffres du code postal = département
      const departement = parseInt(codePostal.substring(0, 2));
      console.log('✅ Code postal trouvé:', codePostal, '→ Département:', departement);
      return departement;
    }
    
    // Valeur par défaut si extraction échoue
    console.warn('⚠️ Impossible d\'extraire le département, utilisation de 75 par défaut');
    return 75; // Paris par défaut
  }
  
  /**
   * Extraction du nom de commune depuis une adresse
   */
  private static extractCommuneFromAddress(adresse: string): string {
    console.log('🔍 Extraction de la commune depuis l\'adresse:', adresse);
    
    // Extraction après le code postal
    const parts = adresse.split(/\d{5}/);
    if (parts.length > 1) {
      const commune = parts[1].trim().split(',')[0].trim();
      console.log('✅ Commune extraite (méthode 1):', commune);
      return commune;
    }
    
    // Extraction basique - dernière partie après virgule
    const addressParts = adresse.split(',');
    const commune = addressParts[addressParts.length - 1].trim();
    console.log('✅ Commune extraite (méthode 2):', commune);
    return commune;
  }
  
  /**
   * Extraction du code postal depuis une adresse
   */
  private static extractCodePostalFromAddress(adresse: string): string {
    console.log('🔍 Extraction du code postal depuis l\'adresse:', adresse);
    
    const codePostalMatch = adresse.match(/\b(\d{5})\b/);
    const codePostal = codePostalMatch ? codePostalMatch[1] : '75000';
    console.log('✅ Code postal extrait:', codePostal);
    return codePostal;
  }
}