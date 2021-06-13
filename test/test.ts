/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use strict'

process.env.NODE_ENV = 'test'

import test from 'ava'
import fs from 'fs'
import path from 'path'

import extractMetadataBlocks from '../src/index'

// eslint-disable-next-line no-undef
process.chdir('./test')

test('File with no metadata blocks returns the content and an empty array.', (t) => {
  const input = fs.readFileSync(path.resolve('./test_data/no-metadata.md'), 'utf-8')
  const output = extractMetadataBlocks(input)
  t.is(output.content, input)
})

test('File with two metadata blocks returns an array of appropriate length.', (t) => {
  const input = fs.readFileSync(path.resolve('./test_data/two-metadata-blocks.md'), 'utf-8')
  const output = extractMetadataBlocks(input)
  t.is(output.metadata.length, 2)
})

test('File with three metadata blocks returns an array of appropriate length.', (t) => {
  const input = fs.readFileSync(path.resolve('./test_data/three-metadata-blocks.md'), 'utf-8')
  const output = extractMetadataBlocks(input)
  t.is(output.metadata.length, 3)
})

test('Metadata blocks are stripped from returned content when requested.', (t) => {
  const input = fs.readFileSync(path.resolve('./test_data/three-metadata-blocks.md'), 'utf-8')
  const output = extractMetadataBlocks(input, true)
  const expectedOutput = fs.readFileSync(path.resolve('./test_data/test_output/stripped-metadata.md'), 'utf-8')
  t.is(output.content, expectedOutput)
})

test('Metadata blocks are not stripped from returned content if not requested.', (t) => {
  const input = fs.readFileSync(path.resolve('./test_data/no-metadata.md'), 'utf-8')
  const output = extractMetadataBlocks(input)
  t.is(output.content, input)
})

test('Metadata values returned are expected values.', (t) => {
  const input = fs.readFileSync(path.resolve('./test_data/three-metadata-blocks.md'), 'utf-8')
  const output = extractMetadataBlocks(input, true)
  const expectedOutput: Array<Record<string, unknown>> = [
    {
      title: 'This is a metadata block',
      subject: 'It has a subject',
      keywords: [ 'And', 'Some', 'Keywords' ]
    },
    { another: 'metadata block', ends: 'with the dot separator' },
    { last: 'metadata block', ends: 'with the dash separator.' }
  ]
  t.deepEqual(output.metadata, expectedOutput)

})

test('Throws an error if a the final metadata block is not terminated.', (t) => {
  const input = fs.readFileSync(path.resolve('./test_data/yaml-block-not-closed.md'), 'utf-8')
  t.throws(() => {
    extractMetadataBlocks(input), undefined, 'Metadata Block beginning on line  does not end.'
  })
})