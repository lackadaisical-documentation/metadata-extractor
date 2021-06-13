# Lackadaisical Metadata Extractor

This is a node module that extracts YAML metadata blocks from within file content and returns an object containing the content, and an an array of Objects representing YAML metadata blocks extracted from the content.

Optionally, the returned content may be stripped of YAML blocks.

The module looks for complete YAML documents (beginning with `---` and ending with `---` or `...`) and will throw an error if an unclosed metadata block exists.

## Usage

```typescript
 function extractMetadataBlocks (fileContent: string, stripMetadata?: boolean )
```

Where:

- `fileContent` is the string that contains YAML metadata blocks that you want exracted
- `stripMetadata` is a boolean value, representing whether we want the returned content to retain the metadata blocks. Default `false`

