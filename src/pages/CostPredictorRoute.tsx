import { useLocation } from 'react-router-dom';
import { hasCostPredictorAccess } from '@/data/costPredictorAccess';
import CostPredictor from './CostPredictor';

export default function CostPredictorRoute() {
  const { hash } = useLocation();
  return <CostPredictor hasAccessLink={hasCostPredictorAccess(hash)} />;
}
