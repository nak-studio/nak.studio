const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

const filesToValidate = [
  { json: './docs/data/artworks.json', schema: './docs/schemas/artwork.schema.json' },
  { json: './docs/data/artworks.migrated.json', schema: './docs/schemas/artwork.schema.json' }
];

let hasErrors = false;

filesToValidate.forEach(({ json, schema }) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(json), 'utf-8'));
    const schemaData = JSON.parse(fs.readFileSync(path.resolve(schema), 'utf-8'));

    const validate = ajv.compile(schemaData);
    const valid = validate(data);

    if (valid) {
      console.log(`${json} ✅ is valid`);
    } else {
      hasErrors = true;
      console.log(`${json} ❌ has errors:`);
      console.log(validate.errors);
    }
  } catch (err) {
    hasErrors = true;
    console.error(`Error reading or parsing ${json} or ${schema}:`, err.message);
  }
});

if (hasErrors) {
  process.exitCode = 1;
}
