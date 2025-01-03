import * as bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import { randomBytes } from 'react-native-randombytes';

/**
 * Generate a mnemonic phrase from entropy
 */
export const createNewWallet = async () => {
 
    // Generate 16 bytes of entropy
    const entropy = randomBytes(16);
    const entropyHex = Buffer.from(entropy).toString('hex');

    // Generate mnemonic from entropy
    const mnemonic = bip39.entropyToMnemonic(entropyHex);

    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Create an Ethereum HD wallet
    const hdWallet = hdkey.fromMasterSeed(seed);
    const walletHdPath = `m/44'/60'/0'/0/0`; // Standard Ethereum path
    const wallet = hdWallet.derivePath(walletHdPath).getWallet();

    // Extract keys and address
    const privateKey = wallet.getPrivateKey().toString('hex');
    const publicKey = wallet.getPublicKey().toString('hex');
    const address = `0x${wallet.getAddress().toString('hex')}`;


    console.log('Wallet created:', { privateKey, publicKey, address });
    return { mnemonic, privateKey, publicKey, address };
};


export const importWalletFromMnemonic = async (mnemonic) => {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
  
    const seed = await bip39.mnemonicToSeed(mnemonic);
  
    // Create Ethereum HD wallet
    const hdWallet = hdkey.fromMasterSeed(seed);
    const walletHdPath = `m/44'/60'/0'/0/0`; // Standard Ethereum path
    const wallet = hdWallet.derivePath(walletHdPath).getWallet();
  
    // Extract keys and address
    const privateKey = wallet.getPrivateKey().toString('hex');
    const publicKey = wallet.getPublicKey().toString('hex');
    const address = `0x${wallet.getAddress().toString('hex')}`;
  
    return { privateKey, publicKey, address };
  };