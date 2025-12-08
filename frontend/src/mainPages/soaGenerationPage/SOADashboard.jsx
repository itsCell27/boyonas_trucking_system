
import React, { useState } from 'react';
import MenuHeader from '@/components/MenuHeader';
import SOAFilters from '@/components/SOAGeneration/SOAFilters';
import SOATable from '@/components/SOAGeneration/SOATable';
import SOAPreview from '@/components/SOAGeneration/SOAPreview';
import { Plus } from 'lucide-react';

const SOAGeneration = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleSetSelectedRecord = (record) => {
    setSelectedRecord(record);
  };

  const headerData = [
    {
      headerName: "Statement of Account",
      headerDescription: "Generate and manage billing statements",
      headerLink: "/app",
      buttons: [
        {
          buttonName: "Generate SOA",
          buttonIcon: Plus,
          buttonLink: "/app/soa-generation/generate",
          buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm",
        }
      ]
    }
  ];

  return (
    <div className="flex-1 pt-10 md:pt-0">
      <MenuHeader headerData={headerData} />
      <div className="mt-6 lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <SOAFilters />
          <SOATable onPreview={handleSetSelectedRecord} />
        </div>
        <div className="mt-6 lg:mt-0">
          <SOAPreview record={selectedRecord} />
        </div>
      </div>
    </div>
  );
};

export default SOAGeneration;
