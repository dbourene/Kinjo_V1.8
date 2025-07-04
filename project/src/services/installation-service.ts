import { supabase } from '../lib/supabase';

export interface InstallationData {
  id: string;
  prm: string;
  puissance: number;
  tarif_base: number;
  latitude: number;
  longitude: number;
  adresse: string;
  titulaire: string;
  producteur_id: string;
  distance?: number;
  energie_injectee?: number;
  producteurs?: {
    id: string;
    contact_prenom: string;
    contact_nom: string;
    contact_email: string;
    sigleUniteLegale?: string;
    denominationUniteLegale?: string;
  };
}

export class InstallationService {
  
  /**
   * Test 1: Vérifier l'accès de base à la table installations
   */
  static async testBasicAccess(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log('🧪 TEST 1: Accès de base à la table installations...');
      
      const { count, error } = await supabase
        .from('installations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Erreur accès installations:', error);
        return { success: false, count: 0, error: error.message };
      }

      console.log(`✅ Accès réussi: ${count} installations dans la base`);
      return { success: true, count: count || 0 };
      
    } catch (error) {
      console.error('❌ Exception lors du test d\'accès:', error);
      return { success: false, count: 0, error: error.message };
    }
  }

  /**
   * Test 2: Récupérer toutes les installations (sans filtre)
   */
  static async getAllInstallations(): Promise<{ success: boolean; installations: any[]; error?: string }> {
    try {
      console.log('🧪 TEST 2: Récupération de toutes les installations...');
      
      const { data: installations, error } = await supabase
        .from('installations')
        .select('*');

      if (error) {
        console.error('❌ Erreur récupération installations:', error);
        return { success: false, installations: [], error: error.message };
      }

      console.log(`✅ ${installations?.length || 0} installations récupérées`);
      
      // Log détaillé des premières installations
      if (installations && installations.length > 0) {
        console.log('📋 Premières installations trouvées:');
        installations.slice(0, 3).forEach((inst, index) => {
          console.log(`  ${index + 1}. ID: ${inst.id}, PRM: ${inst.prm}, Lat: ${inst.latitude}, Lon: ${inst.longitude}`);
        });
      }

      return { success: true, installations: installations || [] };
      
    } catch (error) {
      console.error('❌ Exception lors de la récupération:', error);
      return { success: false, installations: [], error: error.message };
    }
  }

  /**
   * Test 3: Récupérer les installations avec coordonnées valides
   */
  static async getInstallationsWithCoordinates(): Promise<{ success: boolean; installations: any[]; error?: string }> {
    try {
      console.log('🧪 TEST 3: Installations avec coordonnées valides...');
      
      const { data: installations, error } = await supabase
        .from('installations')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('❌ Erreur récupération avec coordonnées:', error);
        return { success: false, installations: [], error: error.message };
      }

      console.log(`✅ ${installations?.length || 0} installations avec coordonnées`);
      
      // Log des coordonnées
      if (installations && installations.length > 0) {
        console.log('📍 Coordonnées des installations:');
        installations.forEach((inst, index) => {
          console.log(`  ${index + 1}. PRM: ${inst.prm}, Lat: ${inst.latitude}, Lon: ${inst.longitude}, Tarif: ${inst.tarif_base}`);
        });
      }

      return { success: true, installations: installations || [] };
      
    } catch (error) {
      console.error('❌ Exception lors de la récupération avec coordonnées:', error);
      return { success: false, installations: [], error: error.message };
    }
  }

  /**
   * Test 4: Vérifier les politiques RLS (optionnel)
   */
  static async testRLSPolicies(): Promise<{ success: boolean; policies: any[]; error?: string }> {
    try {
      console.log('🧪 TEST 4: Vérification des politiques RLS...');
      
      // Requête pour lister les politiques RLS sur la table installations
      const { data: policies, error } = await supabase
        .rpc('get_table_policies', { table_name: 'installations' });

      if (error) {
        console.warn('⚠️ Impossible de récupérer les politiques RLS:', error);
        // Ce n'est pas critique, on continue
        return { success: true, policies: [], error: 'RLS policies not accessible' };
      }

      console.log(`📋 ${policies?.length || 0} politiques RLS trouvées`);
      
      if (policies && policies.length > 0) {
        policies.forEach((policy, index) => {
          console.log(`  ${index + 1}. ${policy.policyname}: ${policy.cmd} pour ${policy.roles}`);
        });
      }

      return { success: true, policies: policies || [] };
      
    } catch (error) {
      console.warn('⚠️ Exception lors de la vérification RLS:', error);
      return { success: true, policies: [], error: error.message };
    }
  }

  /**
   * Test 5: Vérifier l'authentification actuelle
   */
  static async testAuthentication(): Promise<{ success: boolean; user: any; error?: string }> {
    try {
      console.log('🧪 TEST 5: Vérification de l\'authentification...');
      
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ Erreur authentification:', error);
        return { success: false, user: null, error: error.message };
      }

      if (!user) {
        console.error('❌ Aucun utilisateur connecté');
        return { success: false, user: null, error: 'No user authenticated' };
      }

      console.log(`✅ Utilisateur connecté: ${user.email} (ID: ${user.id})`);
      console.log(`📋 Rôle: ${user.role || 'authenticated'}`);
      
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Exception lors de la vérification auth:', error);
      return { success: false, user: null, error: error.message };
    }
  }

  /**
   * Test 6: Vérifier les installations avec join producteurs
   */
  static async testInstallationsWithProducers(): Promise<{ success: boolean; installations: any[]; error?: string }> {
    try {
      console.log('🧪 TEST 6: Installations avec données producteurs...');
      
      const { data: installations, error } = await supabase
        .from('installations')
        .select(`
          *,
          producteurs:producteur_id (
            id,
            contact_prenom,
            contact_nom,
            contact_email,
            sigleUniteLegale,
            denominationUniteLegale
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('❌ Erreur récupération avec producteurs:', error);
        return { success: false, installations: [], error: error.message };
      }

      console.log(`✅ ${installations?.length || 0} installations avec producteurs récupérées`);
      
      // Log détaillé
      if (installations && installations.length > 0) {
        console.log('📋 Installations avec producteurs:');
        installations.forEach((inst, index) => {
          console.log(`  ${index + 1}. PRM: ${inst.prm}, Producteur: ${inst.producteurs?.contact_prenom} ${inst.producteurs?.contact_nom}`);
        });
      }

      return { success: true, installations: installations || [] };
      
    } catch (error) {
      console.error('❌ Exception lors de la récupération avec producteurs:', error);
      return { success: false, installations: [], error: error.message };
    }
  }

  /**
   * Test 7: Vérifier les installations avec énergie injectée
   */
  static async testInstallationsWithEnergy(): Promise<{ success: boolean; installations: any[]; error?: string }> {
    try {
      console.log('🧪 TEST 7: Installations avec énergie injectée...');
      
      const { data: installations, error } = await supabase
        .from('installations')
        .select('*')
        .not('energie_injectee', 'is', null);

      if (error) {
        console.error('❌ Erreur récupération avec énergie:', error);
        return { success: false, installations: [], error: error.message };
      }

      console.log(`✅ ${installations?.length || 0} installations avec énergie injectée`);
      
      // Log détaillé
      if (installations && installations.length > 0) {
        console.log('📋 Installations avec énergie:');
        installations.forEach((inst, index) => {
          console.log(`  ${index + 1}. PRM: ${inst.prm}, Énergie: ${inst.energie_injectee} kWh`);
        });
      }

      return { success: true, installations: installations || [] };
      
    } catch (error) {
      console.error('❌ Exception lors de la récupération avec énergie:', error);
      return { success: false, installations: [], error: error.message };
    }
  }

  /**
   * Test complet de diagnostic
   */
  static async runDiagnostic(): Promise<void> {
    console.log('🚀 === DIAGNOSTIC COMPLET DES INSTALLATIONS ===');
    
    // Test 1: Accès de base
    const test1 = await this.testBasicAccess();
    console.log(`Test 1 - Accès de base: ${test1.success ? '✅' : '❌'} (${test1.count} installations)`);
    if (!test1.success) {
      console.error(`Erreur: ${test1.error}`);
    }

    // Test 2: Récupération complète
    const test2 = await this.getAllInstallations();
    console.log(`Test 2 - Récupération: ${test2.success ? '✅' : '❌'} (${test2.installations.length} installations)`);
    if (!test2.success) {
      console.error(`Erreur: ${test2.error}`);
    }

    // Test 3: Avec coordonnées
    const test3 = await this.getInstallationsWithCoordinates();
    console.log(`Test 3 - Avec coordonnées: ${test3.success ? '✅' : '❌'} (${test3.installations.length} installations)`);
    if (!test3.success) {
      console.error(`Erreur: ${test3.error}`);
    }

    // Test 4: Politiques RLS (optionnel)
    const test4 = await this.testRLSPolicies();
    console.log(`Test 4 - Politiques RLS: ${test4.success ? '✅' : '❌'} (${test4.policies.length} politiques)`);

    // Test 5: Authentification
    const test5 = await this.testAuthentication();
    console.log(`Test 5 - Authentification: ${test5.success ? '✅' : '❌'} (${test5.user?.email || 'N/A'})`);

    // Test 6: Avec producteurs
    const test6 = await this.testInstallationsWithProducers();
    console.log(`Test 6 - Avec producteurs: ${test6.success ? '✅' : '❌'} (${test6.installations.length} installations)`);

    // Test 7: Avec énergie injectée
    const test7 = await this.testInstallationsWithEnergy();
    console.log(`Test 7 - Avec énergie injectée: ${test7.success ? '✅' : '❌'} (${test7.installations.length} installations)`);

    console.log('🏁 === FIN DU DIAGNOSTIC ===');

    // Résumé et analyse
    if (!test1.success || !test2.success || !test3.success) {
      console.error('🚨 PROBLÈME IDENTIFIÉ: Accès aux données bloqué');
      console.error('💡 SOLUTION: Vérifier les politiques RLS pour les consommateurs');
    } else if (test2.installations.length === 0) {
      console.warn('⚠️ PROBLÈME: Aucune installation dans la base de données');
      console.warn('💡 SOLUTION: Vérifier que les installations existent et sont accessibles à cet utilisateur');
      
      // Diagnostic supplémentaire pour comprendre pourquoi 0 installations
      console.log('🔍 DIAGNOSTIC SUPPLÉMENTAIRE:');
      console.log(`- Utilisateur connecté: ${test5.user?.email}`);
      console.log(`- Rôle utilisateur: ${test5.user?.role || 'authenticated'}`);
      console.log('- Vérifiez que les politiques RLS permettent l\'accès aux installations');
      console.log('- Vérifiez que des installations existent dans la base');
    } else {
      console.log('✅ ACCÈS OK: Le problème est ailleurs (calcul de distance, filtres, etc.)');
    }
  }

  /**
   * Déclencher manuellement le calcul de production pour une installation
   */
  static async triggerProductionCalculation(installationId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`🔄 Déclenchement manuel du calcul de production pour l'installation ${installationId}...`);
      
      const { data, error } = await supabase.functions.invoke('calculate-production', {
        body: { installation_id: installationId }
      });

      if (error) {
        console.error('❌ Erreur lors de l\'appel à l\'edge function:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Calcul de production déclenché avec succès:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Exception lors du déclenchement du calcul:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fonction principale pour rechercher les installations à proximité
   */
  static async findNearbyInstallations(
    consumerLat: number, 
    consumerLon: number, 
    maxDistance: number = 20
  ): Promise<InstallationData[]> {
    try {
      console.log('🔍 Recherche d\'installations à proximité...');
      console.log(`📍 Position: ${consumerLat}, ${consumerLon} (rayon: ${maxDistance}km)`);

      // Étape 1: Récupérer toutes les installations avec coordonnées et producteurs
      const { data: installations, error } = await supabase
        .from('installations')
        .select(`
          *,
          producteurs:producteur_id (
            id,
            contact_prenom,
            contact_nom,
            contact_email,
            sigleUniteLegale,
            denominationUniteLegale
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .not('tarif_base', 'is', null);

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      if (!installations || installations.length === 0) {
        console.log('ℹ️ Aucune installation trouvée dans la base');
        return [];
      }

      console.log(`📊 ${installations.length} installations trouvées dans la base`);

      // Étape 2: Calculer les distances
      const installationsWithDistance = installations
        .map(installation => {
          const distance = this.calculateDistance(
            consumerLat,
            consumerLon,
            parseFloat(installation.latitude),
            parseFloat(installation.longitude)
          );

          return {
            ...installation,
            distance
          };
        })
        .filter(installation => installation.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);

      console.log(`✅ ${installationsWithDistance.length} installations trouvées dans un rayon de ${maxDistance}km`);

      return installationsWithDistance;

    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    }
  }

  /**
   * Calcul de distance (formule de Haversine)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}