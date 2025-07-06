# obj-compose

> _“Merge your logic. Trust your types.”_

**obj-compose** is a type-safe, override-friendly object composer for structured configuration and localization systems. Define a `base`, plug in reusable `fragments`, and override anything—statically or dynamically—with full TypeScript inference.

## Features

- 🧠 **Full type inference** for deeply nested objects
- 🔁 **Composable** via base + fragments + overrides
- ⚙️ **Dynamic overrides** with source access
- 🔒 Works great for localization, form structures, config merging, etc.

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
import { compose, pick } from 'obj-compose';

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
        fields: (sources) =>
          pick(
            [
              'signup.form.fields.username',
              'contact.form.fields.email',
              'contact.form.fields.first-name',
              'contact.form.fields.last-name',
            ],
            sources,
          ),
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
- `fragments`: optional reusable pieces (e.g., shared sections)
- `overrides`: optional static or dynamic overrides

Everything is type-inferred automatically.

#### Types

```ts
type ComposeOptions<TBase, TFragments> = {
  base: TBase;
  fragments?: TFragments;
  overrides?: Overrides<TBase, TFragments>;
};
```

### `pick(paths, [base, fragments])`

Picks values from `base` and `fragments` using dot-paths.

Returns an object with keys as the **last segment** of the path.

```ts
const picked = pick(
  ['signup.form.fields.username', 'contact.form.fields.email'],
  [base, fragments],
);
/*
{
  username: 'Choose a username',
  email: 'Email address'
}
*/
```

## Type Inference

All types are inferred automatically, including deeply nested fields.

You can manually annotate if needed:

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
