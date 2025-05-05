#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

function loadSchema(schemaPath) {
  try {
    return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  } catch (err) {
    console.error(
      `Failed to read or parse schema at ${schemaPath}:`,
      err.message,
    );
    process.exit(2);
  }
}

async function main() {
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);

  const schema = loadSchema(path.resolve(__dirname, "schema.json"));
  schema.$id = "root";

  // Validate the schema itself against the JSON Schema meta‑schema
  const valid = ajv.validateSchema(schema);
  if (!valid) {
    console.error("\nSchema is not valid:\n\n");
    for (const err of ajv.errors) {
      console.error(`${err.instancePath || "/"} ${err.message}`);
    }

    process.exit(1);
  }

  console.log("[OK] schema.json is valid");

  // Compile validators for request and response
  ajv.addSchema(schema);
  const validateRequest = ajv.compile({ $ref: "root#/$defs/BidRequest" });
  const validateResponse = ajv.compile({ $ref: "root#/$defs/BidResponse" });

  // Store error state
  let hasErrors = false;

  // Find all test files for requests and validate them
  const requests = glob.sync("tests/request/**/*.json");
  if (requests.length === 0) {
    console.warn("No requests found to validate.");
    process.exit(1);
  }

  for (const request of requests) {
    let data;
    try {
      const raw = fs.readFileSync(request, "utf-8");
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`\n[ERROR] ${request}: Invalid JSON - ${err.message}`);
      hasErrors = true;
      continue;
    }

    const valid = validateRequest(data);
    if (!valid) {
      console.error(`\n[INVALID] ${request}`);
      for (const err of validateRequest.errors) {
        console.error(`  - ${err.instancePath || "/"} ${err.message}`);
      }
      hasErrors = true;
    } else {
      console.log(`[OK] ${request}`);
    }
  }

  // Now do the same for responses
  const responses = glob.sync("tests/response/**/*.json");
  if (responses.length === 0) {
    console.warn("No responses found to validate.");
    process.exit(1);
  }

  for (const response of responses) {
    let data;
    try {
      const raw = fs.readFileSync(response, "utf-8");
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`\n[ERROR] ${response}: Invalid JSON - ${err.message}`);
      hasErrors = true;
      continue;
    }

    const valid = validateResponse(data);
    if (!valid) {
      console.error(`\n[INVALID] ${response}`);
      for (const err of validateResponse.errors) {
        console.error(`  - ${err.instancePath || "/"} ${err.message}`);
      }
      hasErrors = true;
    } else {
      console.log(`[OK] ${response}`);
    }
  }

  process.exit(hasErrors ? 1 : 0);
}

main();
