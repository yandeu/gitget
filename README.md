# gitget

## 📦 Clone GitHub repos fast and easy.

---

## Usage

### Console

```bash
# GitHub Repository

# clone to /repo
# (downloads the default branch of user/repo from GitHub)
$ npx gitget user/repo

# clone to /folder
$ npx gitget user/repo folder

# clone subfolder to /folder
$ npx gitget user/repo/subfolder folder

# specify a tag, branch or commit
$ npx gitget user/repo#dev       # branch
$ npx gitget user/repo#v1.2.3    # release tag
$ npx gitget user/repo#1234abcd  # commit hash

# or simply copy and past the url from your browser
# (downloads the subdir "core/conventional-commits/lib" from lerna/lerna#next)
$ npx gitget https://github.com/lerna/lerna/tree/next/core/conventional-commits/lib
```

```bash
# NPM Package

# download npm package
$ npx gitget npm:packageName

# download npm package to /folder
$ npx gitget npm:packageName folder
```

### Node.js

```ts
interface GitGetOption {
  user?: string
  repo?: string
  folder?: string
  subdir?: string
  /** specify a tag, branch or commit */
  branch?: string
  test?: boolean
  /** silences steps (errors are still displayed) */
  silent?: boolean
  /** npm package name */
  npm?: string
}
```

```js
// index.cjs
const { gitget } = require('gitget')

gitget({ GitGetOptions })
```

```js
// index.mjs
import { gitget } from 'gitget/lib/gitget.js'

gitget({ GitGetOptions })
```

```js
// index.ts
import { gitget } from 'gitget'

gitget({ GitGetOptions })
```

## Try it now!

Download [Day.js](https://github.com/iamkun/dayjs/) for example.

```console
npx gitget iamkun/dayjs
```

## License

[MIT](https://github.com/yandeu/gitget/blob/main/LICENSE)
