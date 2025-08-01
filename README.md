# obj-compose

> _“Merge your logic. Trust your types.”_

**obj-compose** is a type-safe, override-friendly object composer for structured configuration and localization systems. Define a `base`, plug in reusable `fragments`, and override anything—statically or dynamically—with full TypeScript inference. You can also selectively pick or omit deep pieces from composed results.

## Features

- 🧠 **Full type inference** for deeply nested objects
- 🔁 **Composable** via base + fragments + overrides
- ⚙️ **Dynamic overrides** with access to the merged source
- ✂️ **Pick** specific deep values by path
- ❌ **Omit** deep paths from objects safely
- 🔒 Ideal for localization, form structures, config merging, and more

## Installation

```bash
npm install obj-compose
# or
yarn add obj-compose
# or
pnpm add obj-compose
```

## Basic Usage

```ts
import { compose, pick, omit } from 'obj-compose';

const result = compose({
  base: {
    signup: {
      form: {
        fields: {
          username: 'Choose a username',
        },
        validation: {
          username: 'Must be unique',
        },
      },
    },
  },
  fragments: {
    contact: {
      form: {
        fields: {
          email: 'Email address',
          'first-name': 'First name',
          'last-name': 'Last name',
        },
        validation: {
          email: 'Invalid email',
          'first-name': 'Required',
          'last-name': 'Required',
        },
      },
    },
  },
  overrides: {
    signup: {
      form: {
        fields: (merged) =>
          pick(merged, [
            'signup.form.fields.username',
            'contact.form.fields.email',
            'contact.form.fields.first-name',
            'contact.form.fields.last-name',
          ]),
      },
    },
  },
});

console.log(result.signup.form.fields);
/*
{
  username: 'Choose a username',
  email: 'Email address',
  'first-name': 'First name',
  'last-name': 'Last name'
}
*/

// Example of omitting a deep path from the composed result
const cleaned = omit(result, ['signup.form.validation.username']);
// `cleaned.signup.form.validation` no longer has `username`
```

## When to Use

- 🗂️ Merge translation keys from multiple modules
- 🧱 Compose form field definitions from base + shared parts
- ⚙️ Create overrideable app config with dynamic fallback
- 🔀 Build highly reusable design token objects

## API

### `compose({ base, fragments?, overrides? })`

Composes a new object by merging:

- `base`: main object
- `fragments`: optional reusable pieces (each must be a `JsonObject`)
- `overrides`: optional static or dynamic overrides (can be objects or functions that receive the merged source)

Everything is type-inferred automatically, including nested structures and dynamic values.

#### Types

```ts
type ComposeOptions<TBase, TFragments> = {
  base: TBase;
  fragments?: TFragments; // record of JsonObject fragments
  overrides?: Overrides<TBase, TFragments>;
};
```

### `pick(source, paths)`

Picks values from a source object (typically the merged result of base + fragments) by dot-notation paths.

Returns a flat object whose keys are the **last segment** of each path.

```ts
const picked = pick(result, [
  'signup.form.fields.username',
  'contact.form.fields.email',
]);
/*
{
  username: 'Choose a username',
  email: 'Email address'
}
*/
```

### `omit(source, paths)`

Returns a deep-cloned version of `source` with the specified dot-notation paths removed.

```ts
const withoutValidation = omit(result, ['signup.form.validation.username']);
/*
{
  signup: {
    form: {
      fields: { username: 'Choose a username', ... },
      validation: {
        // username is omitted here
        // other validation entries remain
      }
    }
  },
  contact: { ... }
}
*/
```

## Type Inference

All types flow automatically. If you need explicitness:

```ts
import type { ComposeOptions } from 'obj-compose';

const options: ComposeOptions<typeof base, typeof fragments> = {
  base,
  fragments,
  overrides,
};
```

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

**Author:** Estarlin R. · [estarlincito.com](https://estarlincito.com)
