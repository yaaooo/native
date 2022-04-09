# Vue JSON FormSchema

Vue form generator that consumes JSON schema.

> Please note that this is a fork of [@formschema/native](https://github.com/formschema/native) authored by [@demsking](https://github.com/demsking). This fork aims to close out some gaps on the original package and make the generated form behave more intuitively. For example:
> - Values in parent fields are not reset when child fields are added
> - Array inputs with one item will still display control buttons 

## Table of Contents

- [Install](#install)
- [Demo](#demo)
- [Usage](#usage)
- [Features](#features)
- [Supported Keywords](#supported-keywords)
- [Irrelevant (ignored) Keywords](#irrelevant-ignored-keywords)
- [FormSchema API](#formschema-api)
  * [Props](#props)
  * [Events](#events)
  * [Methods](#methods)
    + [form()](#form)
- [Working with Async Schema](#working-with-async-schema)
- [Working with Vue Router](#working-with-vue-router)
- [Workind with JSON Schema $ref Pointers](#workind-with-json-schema-ref-pointers)
- [Data Validation](#data-validation)
  * [Native HTML5 Validation](#native-html5-validation)
  * [Custom Validation API](#custom-validation-api)
  * [Custom Validation with AJV](#custom-validation-with-ajv)
  * [Disable Native HTML5 Validation](#disable-native-html5-validation)
    + [Example: Disable Form Validation using `novalidate`](#example-disable-form-validation-using-novalidate)
    + [Usecase: Implement Save, Cancel and Submit](#usecase-implement-save-cancel-and-submit)
- [Labels Translation](#labels-translation)
- [Render Form Elements](#render-form-elements)
  * [Textarea](#textarea)
  * [File Input](#file-input)
  * [Hidden Input](#hidden-input)
  * [Password Input](#password-input)
  * [Multiple Checkbox](#multiple-checkbox)
  * [Grouped Radio](#grouped-radio)
  * [Select Input](#select-input)
  * [Array Input](#array-input)
  * [Regex Input](#regex-input)
  * [Fieldset Element](#fieldset-element)
- [Custom Form Elements](#custom-form-elements)
  * [Elements API](#elements-api)
  * [Custom Elements Example](#custom-elements-example)
- [Descriptor Interface](#descriptor-interface)
- [Contributing](#contributing)
- [License](#license)

## Install

```sh
npm install --save @yaaooo/vue-json-formschema
```

## Usage

```html
<template>
  <FormSchema :schema="schema" v-model="model" @submit.prevent="submit">
    <button type="submit">Subscribe</button>
  </FormSchema>
</template>

<script>
  import FormSchema from '@yaaooo/vue-json-formschema'
  import schema from './schema/newsletter-subscription.json'

  export default {
    data: () => ({
      schema: schema,
      model: {}
    }),
    methods: {
      submit (e) {
        // this.model contains the valid data according your JSON Schema.
        // You can submit your model to the server here
      }
    },
    components: { FormSchema }
  }
</script>
```

## Features

- [Keywords for Applying Subschemas With Boolean Logic](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7)
- [Validation Keywords for Any Instance Type](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1)<br>
  FormSchema uses:
  - HTML input `text` to render schema with `type: 'string'`
  - HTML input `number` to render schema with `type: 'number' | 'integer'`
  - HTML input `hidden` to render schema with `type: 'null'`
  - HTML input `checkbox` to render schema with `type: 'boolean'`
- [Validation Keywords for Numeric Instances (number and integer)](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2)<br>
  FormSchema parses keywords `maximum`, `minimum`, `exclusiveMaximum` and `exclusiveMinimum` to generate HTML attributes `max` and `min`.
- [Validation Keywords for Strings](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3)<br>
  FormSchema parses keywords `maxLength`, `minLength`, `pattern` to generate HTML attributes `maxlength`, `minlength` and `pattern`.
- [Validation Keywords for Arrays](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4)
- [Semantic Validation With "format"](https://json-schema.org/latest/json-schema-validation.html#rfc.section.7)<br>
  FormSchema uses:
  - HTML input `date` to render schema with `format: 'date'`
  - HTML input `datetime-local` to render schema with `format: 'date-time'`
  - HTML input `email` to render schema with `format: 'email' | 'idn-email'`
  - HTML input `time` to render schema with `format: 'time'`
  - HTML input `url` to render schema with `format: 'uri'`
- [String-Encoding Non-JSON Data](https://json-schema.org/latest/json-schema-validation.html#rfc.section.8)
- [Property dependencies and Schema dependencies](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.7)
- [Schema Re-Use With "definitions"](https://json-schema.org/latest/json-schema-validation.html#rfc.section.9) (see [JSON Schema $ref Pointers](#json-schema-ref-pointers))
- [Schema Annotations](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10)

## Supported Keywords

- [type](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1) is only supported string value. Array type definition is not supported.
- [enum](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.2) is used to render multiple choices input
- [maximum](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.2), [exclusiveMaximum](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.3), [minimum](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.4) and [exclusiveMinimum](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.5) are used to render numeric fields
- [multipleOf](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.1) is used to render the input attribute `step`
- [maxLength](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.1), [minLength](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.2), [pattern](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3) and [const](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.3) are used to render string fields
- [items](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.1), [additionalItems](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.2), [maxItems](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.3), [minItems](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.4) and [uniqueItems](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.5) are used to render array fields
- [dependencies](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.7) is used to implement *Property dependencies* and *Schema dependencies*
- [contentEncoding](https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.3)
- [contentMediaType](https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.4)<br>
  - When `contentMediaType` is equal to `text/*`, the HTML element `<textarea/>` is used for rendering
  - When `contentMediaType` is not equal to `text/*`, the HTML element `<input/>` with attributes `{ type: file, accept: contentMediaType }` is used for rendering
- [title](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1) is used to render the input label
- [description](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1) is used to render the input description
- [default](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.2) is used to define the default input value
- [readOnly](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.3) is used to render a field as an read-only input

## Irrelevant (ignored) Keywords

Since FormSchema is just a form generator, some JSON Schema validation keywords
are irrelevant:

- [contains](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.6)
- [maxProperties](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.1)
- [minProperties](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.2)
- [patternProperties](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.5)
- [additionalProperties](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.6)
- [propertyNames](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.8)
- [not](https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.4)
- [writeOnly](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.3)
- [examples](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.4)

## FormSchema API

### Props

| Name                          | Type                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Default            |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `schema` *required*           | `Object`                                      | The input JSON Schema object.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                    |
| `v-model`                     | `any`                                         | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `undefined`        |
| `id`                          | `String`                                      | The id property of the Element interface represents the form's identifier, reflecting the id global attribute.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `Random unique ID` |
| `name`                        | `String`                                      | The name of the form. It must be unique among the forms in a document.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `undefined`        |
| `bracketed-object-input-name` | `Boolean`                                     | When set to `true` (default), checkbox inputs and nested object inputs will * automatically include brackets at the end of their names (e.g. `name="grouped-checkbox-fields[]"`). Setting this property to `false`, disables this behaviour.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`             |
| `search`                      | `Boolean`                                     | Use this prop to enable `search` landmark role to identify a section of the page used to search the page, site, or collection of sites.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `false`            |
| `disabled`                    | `Boolean`                                     | Indicates whether the form elements are disabled or not.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `false`            |
| `components`                  | `ComponentsLib`                               | Use this prop to overwrite the default Native HTML Elements with custom components.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `GLOBAL.Elements`  |
| `descriptor`                  | [`DescriptorInstance`](#descriptor-interface) | UI Schema Descriptor to use for rendering.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `{}`               |
| `validator`                   | `Function`                                    | The validator function to use to validate data before to emit the `input` event.<br>**Syntax**<br><code class="language-typescript">function validator(field: GenericField): Promise&lt;boolean&gt;</code><br>**Parameters**<br><ul><li>`field: GenericField` The field that requests validation</li><li>`field.id: string` The input ID attribute value</li><li>`field.name: string` The input name attribute value</li><li>`field.value: any` The input value for validation</li><li>`field.schema: JsonSchema` The JSON Schema object of the input</li><li>`field.required: boolean` Boolean indicating whether or not the field is mandatory</li><li>`field.hasChildren: boolean` Boolean indicating whether or not the field has children</li><li>`field.initialValue: any` The initial input value</li><li>`field.messages: Message[]` The input value for validation</li></ul>**Return value**<br>A promise that return `true` if validation success and `false` otherwise<br> | `null`             |

### Events

| Name    | Description                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| `input` | Fired synchronously when the value of an element is changed.<br>**Arguments**<br><ul><li>**`value: any`**</li></ul> |

### Methods

#### form()

Get the HTML form object reference.

**Example**

```html
<template>
  <FormSchema ref="formSchema" :schema="schema"/>
</template>

<script>
  import FormSchema from '@yaaooo/vue-json-formschema'

  export default {
    components: { FormSchema },
    data: () => ({
      schema: { type: 'string' }
    }),
    mounted() {
      console.log(this.$refs.formSchema.form())
    }
  };
</script>
```

**Syntax**

```typescript
form(): HTMLFormElement | VNode | undefined
```

**Return value**

An `HTMLFormElement` object or a `VNode` object describing the form element
object, or `undefined` for input JSON schema object.

## Working with Async Schema

```html
<template>
  <FormSchema :schema="schema"/>
</template>

<script>
  import axios from 'axios'
  import FormSchema from '@yaaooo/vue-json-formschema'

  export default {
    components: { FormSchema },
    data: () => ({
      schema: {}
    }),
    created() {
      axios.get('/api/schema/subscription.json').then(({ data: schema }) => {
        this.schema = schema
      });
    }
  };
</script>
```

## Working with Vue Router

Load an async schema on the `beforeRouterEnter` hook:

```html
<template>
  <FormSchema :schema="schema"/>
</template>

<script>
  import axios from 'axios'
  import FormSchema from '@yaaooo/vue-json-formschema'

  export default {
    components: { FormSchema },
    data: () => ({
      schema: {}
    }),
    beforeRouterEnter(from, to, next) {
      axios.get('/api/schema/subscription.json')
        .then(({ data: schema }) => next((vm) => vm.setSchema(schema)))
        .catch(next);
    },
    methods: {
      setSchema(schema) {
        this.schema = schema;
      }
    }
  };
</script>
```

## Workind with JSON Schema $ref Pointers

To load a JSON Schema with `$ref` pointers, you need to install an additional dependency to resolve them:

```js
import $RefParser from 'json-schema-ref-parser';
import FormSchema from '@yaaooo/vue-json-formschema';
import schemaWithPointers from './schema/with-pointers.json';

export default {
  components: { FormSchema },
  data: () => ({
    schema: {}
  }),
  created () {
    $RefParser.dereference(schemaWithPointers)
      .then((schema) => {
        // `schema` is the resolved schema that contains your entire JSON
        // Schema, including referenced files, combined into a single object
        this.schema = schema;
      });
  }
}
```

See [json-schema-ref-parser documentation page](https://www.npmjs.com/package/json-schema-ref-parser) for more details.

## Data Validation

### Native HTML5 Validation

By default, FormSchema uses basic HTML5 validation by applying validation
attributes on inputs. This is enough for simple schema, but you will need to
dedicated JSON Schema validator if you want to validate complex schema.

### Custom Validation API

For custom validation, you need to provide a [validation function prop](#props).

Bellow the custom validation API:

```ts
type MessageInfo = 0;
type MessageSuccess = 1;
type MessageWarining = 2;
type MessageError = 3;
type MessageType = MessageInfo | MessageSuccess | MessageWarining | MessageError;

interface Message {
  type?: MessageType;
  text: string;
}

interface GenericField<TModel = any> {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly isRoot: boolean;
  readonly schema: JsonSchema;
  readonly required: boolean;
  readonly hasChildren: boolean;
  readonly initialValue: TModel;
  readonly value: TModel;
  readonly messages: Required<Message>[];
  clear(): void; // clear field
  reset(): void; // reset initial field value
  addMessage(message: string, type: MessageType = MessageError): void;
  clearMessages(recursive: boolean = false): void;
}
```

### Custom Validation with AJV

Bellow a basic example with the popular [AJV](https://www.npmjs.com/package/ajv)
validator:

```html
<template>
  <FormSchema v-model="model" v-bind="{ schema, validator }" @submit.prevent="onSubmit">
    <button type="submit">Submit</button>
  </FormSchema>
</template>

<script>
  import Ajv from 'ajv';
  import FormSchema from '@yaaooo/vue-json-formschema';

  export default {
    data: () => ({
      schema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 5
          },
          password: {
            type: 'string',
            minLength: 6
          }
        },
        required: ['username', 'password']
      },
      model: {},
      ajv: new Ajv({ allErrors: true })
    }),
    computed: {
      validate() {
        return this.ajv.compile(this.schema);
      }
    },
    methods: {
      onSubmit({ field }) {
        if (field && this.validator(field)) {
          // validation success, submit code here
        }
      },
      validator(field) {
        // Clear all messages
        field.clearMessages(true);

        if (!this.validate(field.value)) {
          this.validate.errors.forEach(({ dataPath, message }) => {
            const errorField = field.hasChildren
              ? field.getField(dataPath) || field
              : field;

            /**
             * Add a message to `errorField`.
             * The first argument is the message string
             * and the second one the message type:
             *    0 - Message Info
             *    1 - Message Success
             *    2 - Message Warning
             *    3 - Message Error
             */
            errorField.addMessage(message, 3);
          });

          // Return `false` to cancel the `input` event
          return Promise.resolve(false);
        }

        // Return `true` to trigger the `input` event
        return Promise.resolve(true);
      }
    },
    components: { FormSchema }
  };
</script>
```

### Disable Native HTML5 Validation

Since FormSchema use the native HTML Form element, attributes `novalidate` and
`formvalidate` can be used to disable form validation as it described in the
[W3C specification](https://dev.w3.org/html5/spec-LC/association-of-controls-and-forms.html#attr-fs-novalidate):

> If present, they indicate that the form is not to be validated during
  submission.<br>
  The **no-validate state** of an element is true if the element is a
  [submit button](https://dev.w3.org/html5/spec-LC/forms.html#concept-submit-button)
  and the element's `formnovalidate` attribute is present, or if the element's
  [form owner](https://dev.w3.org/html5/spec-LC/association-of-controls-and-forms.html#form-owner)'s
  `novalidate` attribute is present, and `false` otherwise.

#### Example: Disable Form Validation using `novalidate`

```html
<template>
  <FormSchema v-model="model" :schema="schema" novalidate>
    <button type="submit">Submit</button>
  </FormSchema>
</template>
```

#### Usecase: Implement Save, Cancel and Submit

Disable the form validation constraints could be useful when implementing a
*save* feature to the form:

- The user should be able to save their progress even though they haven't fully entered the data in the form
- The user should be able to cancel the saved form data
- The user should be able to submit form data with validation

```html
<template>
  <FormSchema v-model="model" :schema="schema" action="/api/blog/post" method="post">
    <input type="submit" name="submit" value="Submit">
    <input type="submit" formnovalidate name="save" value="Save">
    <input type="submit" formnovalidate name="cancel" value="Cancel">
  </FormSchema>
</template>
```

## Labels Translation

The simple way to translate labels without to change the JSON Schema file is to
use a descriptor.

Here an example with [Vue I18n](https://kazupon.github.io/vue-i18n):

```html
<template>
  <FormSchema v-model="model" :schema="schema" :descriptor="descriptor"/>
</template>

<script>
  import FormSchema from '@yaaooo/vue-json-formschema';

  export default {
    data: () => ({
      schema: {
        type: 'object',
        properties: {
          firstname: {
            type: 'string'
          },
          lastname: {
            type: 'string'
          }
        }
      },
      model: {}
    }),
    computed: {
      descriptor() {
        properties: {
          firstname: {
            label: this.$t('firstname.label'),
            helper: this.$t('firstname.helper')
          },
          lastname: {
            label: this.$t('lastname.label'),
            helper: this.$t('lastname.helper')
          }
        }
      }
    },
    // `i18n` option, setup locale info for component
    // see https://kazupon.github.io/vue-i18n/guide/component.html
    i18n: {
      messages: {
        en: {
          firstname: {
            label: 'First Name',
            helper: 'Your First Name'
          },
          lastname: {
            label: 'Last Name',
            helper: 'Your Last Name'
          }
        },
        fr: {
          firstname: {
            label: 'Prénom',
            helper: 'Votre prénom'
          },
          lastname: {
            label: 'Nom',
            helper: 'Votre nom'
          }
        }
      }
    },
    components: { FormSchema }
  };
</script>
```

## Render Form Elements

### Textarea

Add a `text/*` media types to a string schema to render a Textarea element.

**Example schema.json**

```json
{
  "type": "string",
  "contentMediaType": "text/plain"
}
```

You can also use a descriptor to force the Render to use a Textarea
element:

**Example descriptor.json**

```json
{
  "kind": "textarea"
}
```

### File Input

String schemas with media types not starting with `text/*` are automatically render as Input File elements.

**Example schema.json**

```json
{
  "type": "string",
  "contentMediaType": "image/png"
}
```

> There is a list of [MIME types officially registered by the IANA](http://www.iana.org/assignments/media-types/media-types.xhtml),
  but the set of types supported will be application and operating system
  dependent. Mozilla Developer Network also maintains a
  [shorter list of MIME types that are important for the web](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types).

### Hidden Input

Schemas with descriptor's kind `hidden` are render as hidden input elements.

**Example schema.json**

```json
{
  "type": "string"
}
```

**Example descriptor.json**

```json
{
  "kind": "hidden"
}
```

### Password Input

String schemas with a descriptor's kind `password` are used to render Input
Password elements.

**Example schema.json**

```json
{
  "type": "string"
}
```

**Example descriptor.json**

```json
{
  "kind": "password"
}
```

### Multiple Checkbox

To define multiple checkbox, use the [JSON Schema keyword `anyOf`](http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.27):

**Example schema.json**

```json
{
  "type": "object",
  "properties": {
    "multipleCheckbox": {
      "type": "array",
      "anyOf": [
        "daily",
        "promotion"
      ]
    }
  }
}
```

### Grouped Radio

To group radio elements, use the [JSON Schema keyword `enum`](http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.23)
with a `enum` descriptor:

**Example schema.json**

```json
{
  "type": "string",
  "enum": [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ]
}
```

**Example descriptor.json**

```json
{
  "kind": "enum",
  "items": {
    "monday": { "label": "Monday" },
    "tuesday": { "label": "Tuesday" },
    "wednesday": { "label": "Wednesday" },
    "thursday": { "label": "Thursday" },
    "friday": { "label": "Friday" },
    "saturday": { "label": "Saturday" },
    "sunday": { "label": "Sunday" }
  }
}
```

### Select Input

To group HTML Select element, use the [JSON Schema keyword `enum`](http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.23)
with a `list` descriptor:

**Example schema.json**

```json
{
  "type": "string",
  "enum": [
    "monday",
    "tuesday",
    "wednesday",
    "thruday",
    "friday",
    "saturday",
    "sunday"
  ]
}
```

**Example descriptor.json**

```json
{
  "kind": "list"
}
```

### Array Input

To render a [array field](http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4), define your schema like:

**Example schema.json**

```json
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

`FormSchema` will render a text input by adding a button to add more inputs.

### Regex Input

To render a [regex input](http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3),
define your schema like:

**Example schema.json**

```json
{
  "type": "string",
  "pattern": "[a-e]+"
}
```

### Fieldset Element

FormSchema use a `<fieldset>` element to group inputs of a object JSON Schema:

**Example schema.json**

```json
{
  "type": "object",
  "properties": {
    "firstname": {
      "type": "string"
    },
    "lastname": {
      "type": "string"
    }
  },
  "required": ["firstname"]
}
```

Use descriptor to set labels and helpers. You can also change the order of
properties for the rendering:

**Example descriptor.json**

```json
{
  "properties": {
    "firstname": {
      "label": "First Name",
      "helper": "Your first name"
    },
    "lastname": {
      "label": "Last Name",
      "helper": "Your last name"
    }
  },
  "order": ["lastname", "firstname"]
}
```

## Custom Form Elements

### Elements API

```ts
type SchemaType = 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
type ScalarKind = 'string' | 'password' | 'number' | 'integer' | 'null' | 'boolean' | 'hidden' | 'textarea' | 'image' | 'file' | 'radio' | 'checkbox';
type ItemKind = 'enum' | 'list';
type FieldKind = SchemaType | ScalarKind | ItemKind;
type ComponentsType = 'form' | 'message' | 'button' | 'helper' | FieldKind;
type Component = string | VueComponent | VueAsyncComponent;

interface IComponents {
  set(kind: ComponentsType, component: Component): void;
  get(kind: ComponentsType, fallbackComponent?: Component): Component;
}
```

### Custom Elements Example

To define custom elements, you need to use the `NativeComponents` class and the
`components` prop:

```js
// MyCustomComponents.js

// First, import the base class Components from `@yaaooo/vue-json-formschema` package
import { NativeComponents } from '@yaaooo/vue-json-formschema';

// Then declare your custom components as functional components
import { InputElement } from '@/components/InputElement';
import { StateElement } from '@/components/StateElement';
import { ArrayElement } from '@/components/ArrayElement';
import { FieldsetElement } from '@/components/FieldsetElement';
import { ListElement } from '@/components/ListElement';
import { TextareaElement } from '@/components/TextareaElement';
import { MessageElement } from '@/components/Message';

// Finaly, extend the NativeComponents class and define override it
export class MyCustomComponents extends NativeComponents {
  constructor() {
    super();

    this.set('array', ArrayElement);
    this.set('boolean', StateElement);
    this.set('string', InputElement);
    this.set('password', InputElement);
    this.set('file', InputElement);
    this.set('image', InputElement);
    this.set('radio', StateElement);
    this.set('checkbox', StateElement);
    this.set('enum', FieldsetElement);
    this.set('number', InputElement);
    this.set('integer', InputElement);
    this.set('object', FieldsetElement);
    this.set('list', ListElement);
    this.set('textarea', TextareaElement);
    this.set('message', MessageElement);
  }
}
```

```html
<template>
  <FormSchema v-model="model" :schema="schema" :components="components"/>
</template>

<script>
  import FormSchema from '@yaaooo/vue-json-formschema'
  import { MyCustomComponents } from './MyCustomComponents'

  export default {
    data: () => ({
      schema: { /* ... */ },
      components: new MyCustomComponents(),
      model: {}
    }),
    components: { FormSchema }
  }
</script>
```

## Descriptor Interface

```ts
type SchemaType = 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
type ParserKind = SchemaType | 'enum' | 'list' | 'textarea' | 'image' | 'file' | 'password';
type ScalarKind = 'string' | 'password' | 'number' | 'integer' | 'null' | 'boolean' | 'hidden' | 'textarea' | 'image' | 'file' | 'radio' | 'checkbox';
type ItemKind = 'enum' | 'list';
type FieldKind = SchemaType | ScalarKind | ItemKind;
type ComponentsType = 'form' | 'message' | 'button' | 'helper' | FieldKind;
type Component = string | VueComponent | AsyncVueComponent;

type SetDescriptor = EnumDescriptor | ArrayDescriptor | ObjectDescriptor;
type Descriptor = ScalarDescriptor | SetDescriptor | ListDescriptor;
type DescriptorConstructor = (field: Field) => Descriptor;
type DescriptorInstance = Descriptor | DescriptorConstructor;

interface DescriptorDefinition<TKind extends FieldKind = FieldKind> {
  kind?: TKind;
  label?: string;
  helper?: string;
  visible?: boolean; // by default true. If false, component will be ignored on rendering
  component?: Component;
  attrs?: {
    [attr: string]: unknown;
  };
  props?: {
    [prop: string]: unknown;
  };
}

/**
 * Describe scalar types like: string, password, number, integer,
 * boolean, null, hidden field, textarea element, image and file
 * inputs, radio and checkbox elements
 */
interface ScalarDescriptor extends DescriptorDefinition<ScalarKind> {
}

/**
 * Use to describe grouped object properties
 */
interface ObjectGroupDescriptor extends DescriptorDefinition {
  properties: string[];
}

/**
 * Describe JSON Schema with type `object`
 */
interface ObjectDescriptor extends DescriptorDefinition {
  layout?: Component; // default: 'fieldset'
  properties?: {
    [schemaProperty: string]: DescriptorInstance;
  };
  order?: string[];
  groups?: {
    [groupId: string]: ObjectGroupDescriptor;
  };
}

/**
 * Describe JSON Schema with key `enum`
 */
interface ItemsDescriptor<TKind extends ItemKind> extends DescriptorDefinition<TKind> {
  items?: {
    [itemValue: string]: ScalarDescriptor;
  };
}

/**
 * Describe HTML Radio Elements
 */
interface EnumDescriptor extends ItemsDescriptor<'enum'> {
  layout?: Component; // default: 'fieldset'
}

/**
 * Describe HTML Select Element
 */
interface ListDescriptor extends ItemsDescriptor<'list'> {
}

/**
 * Describe buttons for array schema
 */
interface ButtonDescriptor<T extends string, A extends Function> extends Partial<ActionButton<A>> {
  type: T;
  label: string;
  tooltip?: string;
  visible?: boolean;
  component?: Component;
}

type ActionPushTrigger = () => void;

type PushButtonDescriptor = ButtonDescriptor<'push', ActionPushTrigger>;
type MoveUpButtonDescriptor = ButtonDescriptor<'moveUp', ActionPushTrigger>;
type MoveDownButtonDescriptor = ButtonDescriptor<'moveDown', ActionPushTrigger>;
type DeleteButtonDescriptor = ButtonDescriptor<'delete', ActionPushTrigger>;
type UnknownButtonDescriptor = ButtonDescriptor<string, ActionPushTrigger>;

type ArrayItemButton = MoveUpButtonDescriptor
  | MoveDownButtonDescriptor
  | DeleteButtonDescriptor
  | UnknownButtonDescriptor;

/**
 * Describe JSON Schema with type `array`
 */
interface ArrayDescriptor extends DescriptorDefinition {
  layout?: Component; // default: 'fieldset'
  items?: DescriptorInstance[] | DescriptorInstance;
  pushButton: PushButtonDescriptor | null;
  buttons: ArrayItemButton[];
}
```

## License

Under the MIT license. See [LICENSE](https://github.com/yaaooo/vue-json-formschema/blob/master/LICENSE) file for more details.