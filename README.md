# gitget

## 📦 Clone GitHub repos fast and easy.

---

## Usage

Download the default branch of a repo from GitHub:

```console
# clone to /repo
$ npx gitget user/repo

# clone to /folder
$ npx gitget user/repo folder

# clone only a specific subfolder to /folder
$ npx gitget user/repo/subfolder folder
```

```js
// index.cjs
const { gitget } = require('gitget')

gitget('user', 'repo', 'folder', 'subfolder')
```

```js
// index.mjs
import { gitget } from 'gitget/lib/gitget.js'

gitget('user', 'repo', 'folder', 'subfolder')
```

```js
// index.ts
import { gitget } from 'gitget'

gitget('user', 'repo', 'folder', 'subfolder')
```

## License

[MIT](https://github.com/yandeu/gitget/blob/main/LICENSE)
