// Base script from https://github.com/ai/nanoid/blob/main/non-secure/index.js
export function generateRandomCode(): string {
  let id = ''
  let length = 21
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  // A compact alternative for `for (var i = 0; i < step; i++)`.
  while (length--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += alphabet[(Math.random() * alphabet.length) | 0]
  }

  return id
}
