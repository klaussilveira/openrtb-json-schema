# OpenRTB 2.6 JSON Schema

This project provides a JSON Schema Draft 07 definition ([https://json-schema.org/draft-07](https://json-schema.org/draft-07)) based on
the IAB OpenRTB 2.6 specification ([https://iabtechlab.com/standards/openrtb/](https://iabtechlab.com/standards/openrtb/)).

The primary goal is to define the OpenRTB 2.6 specification in a
machine-readable format using JSON Schema. This facilitates:

* **Validation:** Easier validation of OpenRTB requests and responses
against the official specification.
* **Code Generation:** Simplified generation of OpenRTB 2.6 compliant
clients and servers directly from the schema definition.

## Contents

* **schema.json**: Core schema files defining OpenRTB 2.6
* **specification.md**: Original OpenRTB 2.6 specification

## Testing

To run the tests that validate the example requests and responses against the
schema, first install the dependencies:

    $ npm install

Then run the tests:

    $ npm test
