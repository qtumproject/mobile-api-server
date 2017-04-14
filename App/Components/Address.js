const bs58 = require('bs58');
const crypto = require('crypto');

class Address {

    static isValid(address, network) {

        address = address.trim();

        try {
            const buffer = bs58.decode(address);

            if (buffer.length < 4) {
                throw new Error("Input string too short");
            }

            let data = buffer.slice(0, -4),
                csum = buffer.slice(-4),
                cryptoFirstHash = crypto.createHash('sha256').update(data).digest(),
                hash = crypto.createHash('sha256').update(cryptoFirstHash).digest(),
                hash4 = hash.slice(0, 4);

            if (csum.toString('hex') !== hash4.toString('hex')) {
                throw new Error("Checksum mismatch");
            }

            if (data.length !== 1 + 20) {
                throw new Error('Address buffers must be exactly 21 bytes.');
            }

            let networks = {
                testnet: {
                    name: 'testnet',
                    pubkeyhash: 0x6f,
                    privatekey: 0xef
                },
                livenet: {
                    name: 'livenet',
                    pubkeyhash: 0x00,
                    privatekey: 0x80
                }
            };

            let currentNetwork = networks[network];

            if (currentNetwork['pubkeyhash'] !== data[0] && currentNetwork['scripthash'] !== data[0]) {
                throw new Error('Address has mismatched network type.');
            }

            return true;

        } catch (e) {
            return false;
        }

    }
}

module.exports = Address;