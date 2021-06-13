/**
 * BEGIN HEADER
 *
 * Contains:    Extract Metadata Command
 * CVM-Role:    <none>
 * Maintainer:  Matt Jolly
 * License:     GNU GPL v3
 *
 * Description:   This command extracts yaml documents from a file (metadata blocks). Optionally strips metadata blocks from the output content.
 *
 * END HEADER
 */


import YAML from 'yaml'
import { EOL } from 'os'

export interface DocumentContent {
  content: string,
  metadata: Array<Record<string, unknown>>
}

export default function extractMetadataBlocks (fileContent: string, stripMetadata?: boolean ) {

  const output: DocumentContent = {
    content: '',
    metadata: []
  }

  const yamlOpen = '---'
  const yamlClose = '...'

  // Break the file into an array of lines.
  const fileLines = fileContent.split(/\r?\n/)

  const yamlBeginning: number[] = []
  const yamlEnd: number[] = []
  const yamlBlocks: number[][] = []

  let findingBeginning = true

  if (fileLines.includes(yamlOpen)) {

    for (let i = 0; i < fileLines.length; i++) {

      if (fileLines[i].trim().includes(yamlOpen) && findingBeginning) {
        yamlBeginning.push(i)
        findingBeginning = false
      } else if (!findingBeginning && (fileLines[i].trim().includes(yamlClose) || fileLines[i].trim().includes(yamlOpen)) ) {
        yamlEnd.push(i)
        findingBeginning = true
      }
    }

    // Check that we found a matching number of Beginning and Ending lines
    // We should actually check that a yaml block contains YAML, and not some arbitrary content,
    // but that's hard and trying to parse bad YAML will throw an error anyway.
    if (yamlBeginning.length != yamlEnd.length) {
      throw new Error (`Metadata Block beginning on line ${yamlBeginning[yamlBeginning.length - 1] + 1} does not end.`)
    }

    // Combine our associated beginnings and ends
    yamlBeginning.forEach((value, index) => {
      yamlBlocks.push([value, yamlEnd[index]])
    })

    // Slice our array and send the YAML block to be turned into an object.
    yamlBlocks.forEach((value) => {
      // YAML.parse gets unhappy if you send a separator; it thinks you have a different document, so don't send the separator
      output.metadata.push(YAML.parse(fileLines.slice(value[0],value[1]).join(EOL)))
    })

    // Splice the fileLines array to remove the metadata.
    // If we've already spliced the array, shift the index where we start removing lines
    let spliceValues: number[] = []
    yamlBlocks.forEach((value) => {
      let valueShift = spliceValues.length > 0 ? spliceValues[spliceValues.length - 1] : 0
      if (spliceValues.length > 0) {
        fileLines.splice(value[0] - valueShift, value[1] - value[0] + 1)
      } else {
       fileLines.splice(value[0], value[1] - value[0] + 1)
      }
      spliceValues.push(value[1] - value[0] + 1 + valueShift)
    })

    output.content = stripMetadata ? fileLines.join(EOL) : fileContent

  } else {
    // No need to process anything
    output.content = fileContent
  }

  return output
}