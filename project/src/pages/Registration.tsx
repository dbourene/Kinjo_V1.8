import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { ConsumerRegistration } from './ConsumerRegistration';
import { ProducerRegistration } from './ProducerRegistration';

export const Registration = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') as 'producteur' | 'consommateur';

  // Rediriger vers la page d'accueil si aucun type n'est spécifié
  if (!userType || (userType !== 'producteur' && userType !== 'consommateur')) {
    return <Navigate to="/" replace />;
  }

  // Rendre le composant approprié selon le type d'utilisateur
  if (userType === 'consommateur') {
    return <ConsumerRegistration />;
  }

  if (userType === 'producteur') {
    return <ProducerRegistration />;
  }

  // Fallback (ne devrait jamais être atteint)
  return <Navigate to="/" replace />;
};