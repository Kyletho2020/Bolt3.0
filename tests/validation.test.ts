import test from 'node:test'
import assert from 'node:assert'
import { equipmentSchema, pieceSchema, logisticsSchema } from '../src/lib/validation'

test('equipmentSchema rejects missing project name', async () => {
  await assert.rejects(
    equipmentSchema.validate({
      projectName: '',
      companyName: '',
      contactName: '',
      siteAddress: '',
      sitePhone: '',
      shopLocation: '',
      scopeOfWork: ''
    }, { abortEarly: false })
  )
})

test('pieceSchema rejects quantity below 1', async () => {
  await assert.rejects(
    pieceSchema.validate({
      description: 'test',
      quantity: 0,
      length: '1',
      width: '1',
      height: '1',
      weight: '1'
    })
  )
})

test('logisticsSchema rejects when missing pickup address', async () => {
  await assert.rejects(
    logisticsSchema.validate({
      pieces: [{ description: 'a', quantity: 1, length: '1', width: '1', height: '1', weight: '1' }],
      pickupAddress: '',
      pickupCity: 'c',
      pickupState: 's',
      pickupZip: 'z',
      deliveryAddress: 'd',
      deliveryCity: 'dc',
      deliveryState: 'ds',
      deliveryZip: 'dz',
      shipmentType: 'LTL',
      truckType: 'Flatbed',
      storageType: '',
      storageSqFt: ''
    })
  )
})
