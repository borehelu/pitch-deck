import Crypto from 'crypto'

function randomString(size = 32) {  
  return Crypto
    .randomBytes(size)
    .toString('base64')
    .slice(0, size)
}

console.log(  
  randomString()
)