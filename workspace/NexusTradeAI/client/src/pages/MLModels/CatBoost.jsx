import React from 'react';
import { TreePine } from 'lucide-react';
import MLModelTemplate from './MLModelTemplate';

const CatBoost = () => {
  return (
    <MLModelTemplate
      modelName="CatBoost"
      icon={TreePine}
      accuracy="93.4%"
      precision="91.7%"
      recall="92.1%"
      f1Score="91.9%"
      description="Gradient boosting algorithm that handles categorical features automatically without preprocessing. Excellent for structured financial data with mixed feature types."
      features={[
        "• Automatic categorical feature handling",
        "• Robust to overfitting",
        "• Fast training and prediction",
        "• Built-in feature importance"
      ]}
      currentSignal="Buy Signal"
      confidence="89%"
      target="$4,180 (+0.8%)"
    />
  );
};

export default CatBoost;
