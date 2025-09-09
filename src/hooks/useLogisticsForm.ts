import { useState } from 'react';

export const useLogisticsForm = () => {
  const initialLogisticsData = {
    pieces: [{ description: '', quantity: 1, length: '', width: '', height: '', weight: '' }],
    pickupAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupZip: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    shipmentType: '',
    truckType: '',
    storageType: '',
    storageSqFt: ''
  };

  const [logisticsData, setLogisticsData] = useState(initialLogisticsData);
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);

  const handleLogisticsChange = (field: string, value: string) => {
    setLogisticsData(prev => ({ ...prev, [field]: value }));
  };

  const handlePieceChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setLogisticsData(prev => ({
      ...prev,
      pieces: prev.pieces.map((piece, i) =>
        i === index ? { ...piece, [field]: value } : piece
      )
    }));
  };

  const addPiece = () => {
    setLogisticsData(prev => ({
      ...prev,
      pieces: [
        ...prev.pieces,
        { description: '', quantity: 1, length: '', width: '', height: '', weight: '' }
      ]
    }));
  };

  const removePiece = (index: number) => {
    if (logisticsData.pieces.length > 1) {
      setLogisticsData(prev => ({
        ...prev,
        pieces: prev.pieces.filter((_, i) => i !== index)
      }));
      setSelectedPieces(prev =>
        prev
          .filter(i => i !== index)
          .map(i => (i > index ? i - 1 : i))
      );
    }
  };

  const togglePieceSelection = (index: number) => {
    setSelectedPieces(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const deleteSelectedPieces = () => {
    if (selectedPieces.length === 0) return;
    setLogisticsData(prev => ({
      ...prev,
      pieces: prev.pieces.filter((_, i) => !selectedPieces.includes(i))
    }));
    setSelectedPieces([]);
  };

  return {
    logisticsData,
    setLogisticsData,
    selectedPieces,
    setSelectedPieces,
    initialLogisticsData,
    handleLogisticsChange,
    handlePieceChange,
    addPiece,
    removePiece,
    togglePieceSelection,
    deleteSelectedPieces
  };
};

export default useLogisticsForm;
