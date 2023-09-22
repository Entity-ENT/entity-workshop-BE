import {createCipheriv, createDecipheriv, createHash, randomBytes} from 'crypto';

export class CipherUtils {
    /**
     * Returns decrypted value by providing the text, cipher algorithm and cipher password
     */
    public static decryptCipher<T>(text: string, cipherAlgorithm: string, cipherPassword: string): T | undefined {
        if (!text || !cipherAlgorithm || !cipherPassword) {
            return undefined;
        }

        const textParts = text.split(':');
        if (textParts.length === 0) {
            return undefined;
        }

        const cipherInitializationVector = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = createDecipheriv(cipherAlgorithm, cipherPassword, cipherInitializationVector);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        try {
            return JSON.parse(decrypted.toString());
        } catch (e) {
            return undefined;
        }
    }

    /**
     * Encrypts a given string (dataToEncode) by using required secrets
     */
    public static encryptStringCipher(
        dataToEncode: string,
        cipherIv: string,
        cipherAlgorithm: string,
        cipherPassword: string,
    ): string {
        if (!dataToEncode || !cipherIv || !cipherAlgorithm || !cipherPassword) {
            return undefined;
        }

        const iv = randomBytes(Number(cipherIv));
        const key = createHash('sha256').update(String(cipherPassword)).digest();
        const cipher = createCipheriv(cipherAlgorithm, key, iv);
        return (
            iv.toString('hex') +
            ':' +
            cipher.update(JSON.stringify(dataToEncode || {}), 'utf8', 'base64') +
            cipher.final('base64')
        );
    }
}
