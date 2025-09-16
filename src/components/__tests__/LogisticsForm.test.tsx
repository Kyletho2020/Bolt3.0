import test from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import LogisticsForm from '../LogisticsForm';

test('LogisticsForm renders Logistics Quote heading', () => {
  const data = {
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

  const html = renderToString(
    <LogisticsForm
      data={data}
      selectedPieces={[]}
      onFieldChange={() => {}}
      onPieceChange={() => {}}
      addPiece={() => {}}
      removePiece={() => {}}
      togglePieceSelection={() => {}}
      deleteSelectedPieces={() => {}}
      register={() => ({ onChange: () => {}, onBlur: () => {}, ref: () => {} }) as any}
      setValue={(() => {}) as any}
      errors={{}}
      siteAddress=""
    />
  );

  assert.ok(html.includes('Logistics Quote'));
});
