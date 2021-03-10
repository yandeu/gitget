# gitget

## 📦 Clone GitHub repos fast and easy.

---

## Usage

### Console

```bash
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
```

### Node.js

```ts
interface GitGetOption {
  user: string
  repo: string
  folder?: string
  subdir?: string
  /** specify a tag, branch or commit */
  branch?: string
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

## License

[MIT](https://github.com/yandeu/gitget/blob/main/LICENSE)
